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
  // CloudFront, and any future custom-domain certificate, live in us-east-1.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  ssmPrefix: '/latent-inference',
  githubRepo: 'sudhamanc/Coursenews',
  budgetEmail: app.node.tryGetContext('budgetEmail') || process.env.BUDGET_EMAIL || undefined,
  monthlyBudgetUsd: Number(app.node.tryGetContext('monthlyBudgetUsd') ?? 5),
});
