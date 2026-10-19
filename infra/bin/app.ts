/**
 * CDK app for Latent Inference. Deployed by scripts/deploy.sh (locally or from
 * GitHub Actions). Optional context:
 *
 *   -c budgetEmail=you@example.com   email for the monthly budget alert
 *   -c monthlyBudgetUsd=5            alert threshold (default $5)
 */
import { App } from 'aws-cdk-lib';
import { SiteStack } from '../lib/site-stack';

const app = new App();

new SiteStack(app, 'LatentInference', {
  // us-east-2 is this project's only Region: a service control policy denies
  // regional service actions anywhere else. CloudFront is global, so the CDN
  // is created from here; a future custom-domain certificate is the one piece
  // that must live in us-east-1, and it needs its own stack there.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-2' },
  ssmPrefix: '/latent-inference',
  githubRepo: 'sudhamanc/Coursenews',
  budgetEmail: app.node.tryGetContext('budgetEmail') || process.env.BUDGET_EMAIL || undefined,
  monthlyBudgetUsd: Number(app.node.tryGetContext('monthlyBudgetUsd') ?? 5),
});
