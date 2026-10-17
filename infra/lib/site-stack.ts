/**
 * Latent Inference on AWS.
 *
 *   CloudFront ─┬─ default  → S3 "site" bucket (the static Astro build)
 *               └─ /api/*   → Lambda "api" (Function URL) → S3 "data" bucket
 *   EventBridge Scheduler   → Lambda "jobs" (the /latest refreshes)
 *
 * Everything here sits inside AWS's always-free tiers at this site's traffic.
 * AWS has no hard spend cap, so a monthly budget alert is the backstop.
 */
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  type StackProps,
  aws_budgets as budgets,
  aws_cloudfront as cf,
  aws_cloudfront_origins as origins,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as nodejs,
  aws_logs as logs,
  aws_s3 as s3,
  aws_scheduler as scheduler,
  aws_ssm as ssm,
} from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { parseRedirects, viewerRequestCode } from './redirects';

// The package is ESM, so derive the repo root from this module's URL.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export interface SiteStackProps extends StackProps {
  /** SSM path holding the secrets (SecureStrings created by hand; see README). */
  ssmPrefix: string;
  /** GitHub repo allowed to deploy from its main branch, e.g. "owner/name". */
  githubRepo: string;
  /** Where the budget alert goes. No budget is created without one. */
  budgetEmail?: string;
  monthlyBudgetUsd: number;
}

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);
    const { ssmPrefix } = props;

    /* ---------------------------------------------------------- storage */

    const siteBucket = new s3.Bucket(this, 'Site', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // the build can always be re-uploaded
    });

    const dataBucket = new s3.Bucket(this, 'Data', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN, // chat history and the edition archive
      // Daily chat counters are only read on their own day.
      lifecycleRules: [{ prefix: 'rate-limits/', expiration: Duration.days(3) }],
    });

    /* ---------------------------------------------------------- compute */

    // The stack's own UUID: stable, unguessable, and never typed by anyone.
    // CloudFront sends it on every /api request; the Lambda refuses requests
    // without it, so the Function URL can't be called around the CDN.
    const originSecret = Fn.select(2, Fn.split('/', this.stackId));
    // Read at runtime from SSM: passing the distribution id in the env would
    // make the Lambda depend on the distribution that depends on the Lambda.
    const distributionIdParam = `${ssmPrefix}/DISTRIBUTION_ID`;

    const common: Partial<nodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      projectRoot: ROOT,
      depsLockFilePath: path.join(ROOT, 'package-lock.json'),
      bundling: { minify: true, target: 'node22', externalModules: ['@aws-sdk/*'] },
      environment: {
        DATA_BUCKET: dataBucket.bucketName,
        SSM_PREFIX: ssmPrefix,
        ORIGIN_SECRET: originSecret,
        CHAT_MODEL: 'claude-haiku-4-5',
        NEWS_MODEL: 'claude-haiku-4-5',
        BRIEFING_MODEL: 'claude-sonnet-5-5',
        CHAT_DAILY_CAP: '100',
        CHAT_GLOBAL_DAILY_CAP: '300',
        CHAT_MAX_INPUT_CHARS: '4000',
      },
    };

    const api = new nodejs.NodejsFunction(this, 'Api', {
      ...common,
      entry: path.join(ROOT, 'server/aws/api.ts'),
      timeout: Duration.seconds(30),
      logGroup: new logs.LogGroup(this, 'ApiLogs', { retention: logs.RetentionDays.TWO_WEEKS }),
    });

    const jobs = new nodejs.NodejsFunction(this, 'Jobs', {
      ...common,
      entry: path.join(ROOT, 'server/aws/jobs.ts'),
      timeout: Duration.seconds(120),
      logGroup: new logs.LogGroup(this, 'JobsLogs', { retention: logs.RetentionDays.TWO_WEEKS }),
    });

    for (const fn of [api, jobs]) {
      dataBucket.grantReadWrite(fn);
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['ssm:GetParameters'],
          resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter${ssmPrefix}/*`],
        }),
      );
      // SecureStrings use the AWS-managed aws/ssm key, only via SSM.
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['kms:Decrypt'],
          resources: ['*'],
          conditions: { StringEquals: { 'kms:ViaService': `ssm.${this.region}.amazonaws.com` } },
        }),
      );
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['cloudfront:CreateInvalidation'],
          resources: [`arn:aws:cloudfront::${this.account}:distribution/*`],
        }),
      );
    }

    const apiUrl = api.addFunctionUrl({ authType: lambda.FunctionUrlAuthType.NONE });

    /* ------------------------------------------------------------- CDN */

    const securityHeaders = new cf.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        // Copied from the old netlify.toml. 'unsafe-inline' is needed because
        // KaTeX/Shiki emit inline styles and Astro inlines its small scripts.
        contentSecurityPolicy: {
          override: true,
          contentSecurityPolicy:
            "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; manifest-src 'self'",
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cf.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: cf.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: false },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(63072000),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          { header: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()', override: true },
          { header: 'Cross-Origin-Opener-Policy', value: 'same-origin', override: true },
        ],
      },
    });

    // /api/* caching follows each response's own Cache-Control (s-maxage), and
    // the cache key is the path plus the `date` query only.
    const apiCache = new cf.CachePolicy(this, 'ApiCache', {
      queryStringBehavior: cf.CacheQueryStringBehavior.allowList('date'),
      headerBehavior: cf.CacheHeaderBehavior.none(),
      cookieBehavior: cf.CacheCookieBehavior.none(),
      minTtl: Duration.seconds(0),
      defaultTtl: Duration.seconds(0),
      maxTtl: Duration.days(7),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    const apiForward = new cf.OriginRequestPolicy(this, 'ApiForward', {
      queryStringBehavior: cf.OriginRequestQueryStringBehavior.all(),
      headerBehavior: cf.OriginRequestHeaderBehavior.allowList(
        'x-visitor-id',
        'x-refresh-key',
        'content-type',
        'cloudfront-viewer-address',
      ),
      cookieBehavior: cf.OriginRequestCookieBehavior.none(),
    });

    const pageRequest = new cf.Function(this, 'PageRequest', {
      runtime: cf.FunctionRuntime.JS_2_0,
      code: cf.FunctionCode.fromInline(viewerRequestCode(parseRedirects(path.join(ROOT, 'public/_redirects')))),
    });

    const distribution = new cf.Distribution(this, 'Cdn', {
      comment: 'Latent Inference',
      priceClass: cf.PriceClass.PRICE_CLASS_100,
      httpVersion: cf.HttpVersion.HTTP2_AND_3,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cf.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeaders,
        compress: true,
        functionAssociations: [{ function: pageRequest, eventType: cf.FunctionEventType.VIEWER_REQUEST }],
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.FunctionUrlOrigin(apiUrl, { customHeaders: { 'X-Origin-Verify': originSecret } }),
          viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cf.AllowedMethods.ALLOW_ALL,
          cachePolicy: apiCache,
          originRequestPolicy: apiForward,
          responseHeadersPolicy: securityHeaders,
          compress: true,
        },
      },
      // S3 answers 403 for a missing key (the OAC can't list the bucket).
      // These apply distribution-wide; API clients check res.ok before reading
      // a body, so a swapped error page on /api is harmless.
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: Duration.seconds(10),
      })),
    });

    new ssm.StringParameter(this, 'DistributionIdParam', {
      parameterName: distributionIdParam,
      stringValue: distribution.distributionId,
    });

    /* ------------------------------------------------------- schedules */

    const schedulerRole = new iam.Role(this, 'SchedulerRole', {
      assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
    });
    jobs.grantInvoke(schedulerRole);

    const schedule = (id: string, expression: string, job: string) =>
      new scheduler.CfnSchedule(this, id, {
        scheduleExpression: expression,
        scheduleExpressionTimezone: 'UTC',
        flexibleTimeWindow: { mode: 'OFF' },
        target: {
          arn: jobs.functionArn,
          roleArn: schedulerRole.roleArn,
          input: JSON.stringify({ job }),
          retryPolicy: { maximumRetryAttempts: 0 }, // a retry would spend Anthropic budget twice
        },
      });
    schedule('NewsDaily', 'cron(0 13 * * ? *)', 'news');
    schedule('BriefingWeekdays', 'cron(30 13 ? * MON-FRI *)', 'briefing');

    /* ------------------------------------------------- GitHub deploys */

    const github = new iam.OpenIdConnectProvider(this, 'GitHubOidc', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });
    const deployRole = new iam.Role(this, 'GitHubDeployRole', {
      roleName: 'latent-inference-github-deploy',
      assumedBy: new iam.WebIdentityPrincipal(github.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${props.githubRepo}:ref:refs/heads/main`,
        },
      }),
      maxSessionDuration: Duration.hours(1),
    });
    // `cdk deploy` works by assuming the bootstrap roles.
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
      }),
    );
    deployRole.addToPolicy(
      new iam.PolicyStatement({ actions: ['cloudformation:DescribeStacks'], resources: [this.stackId] }),
    );
    siteBucket.grantReadWrite(deployRole);
    siteBucket.grantDelete(deployRole);
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`],
      }),
    );

    /* ---------------------------------------------------------- budget */

    if (props.budgetEmail) {
      new budgets.CfnBudget(this, 'MonthlyBudget', {
        budget: {
          budgetName: 'latent-inference-monthly',
          budgetType: 'COST',
          timeUnit: 'MONTHLY',
          budgetLimit: { amount: props.monthlyBudgetUsd, unit: 'USD' },
        },
        notificationsWithSubscribers: [50, 100].map((threshold) => ({
          notification: { notificationType: 'ACTUAL', comparisonOperator: 'GREATER_THAN', threshold, thresholdType: 'PERCENTAGE' },
          subscribers: [{ subscriptionType: 'EMAIL', address: props.budgetEmail! }],
        })),
      });
    }

    /* --------------------------------------------------------- outputs */

    new CfnOutput(this, 'SiteUrl', { value: `https://${distribution.distributionDomainName}` });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
    new CfnOutput(this, 'DataBucketName', { value: dataBucket.bucketName });
    new CfnOutput(this, 'DeployRoleArn', { value: deployRole.roleArn });
  }
}
