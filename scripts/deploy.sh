#!/usr/bin/env bash
#
# Deploy Latent Inference to AWS: infrastructure first (CDK: CloudFront, S3,
# the Lambdas, schedules), then the static site.
#
#   npm run deploy                 from a laptop signed in with `aws login`
#   (GitHub Actions runs the same script on every push to main)
#
# Optional: BUDGET_EMAIL=you@example.com creates the monthly budget. It tracks
# spend in the console but cannot send mail (see infra/lib/site-stack.ts).
#
set -euo pipefail
cd "$(dirname "$0")/.."

STACK=LatentInference
REGION=us-east-2
export AWS_REGION=$REGION

CDK_ARGS=(--require-approval never)
[ -n "${BUDGET_EMAIL:-}" ] && CDK_ARGS+=(-c "budgetEmail=$BUDGET_EMAIL")

echo "==> 1/4 Infrastructure (cdk deploy)"
npx cdk deploy "$STACK" "${CDK_ARGS[@]}"

out() {
  aws cloudformation describe-stacks --stack-name "$STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}
SITE_URL="$(out SiteUrl)"
BUCKET="$(out SiteBucketName)"
DIST="$(out DistributionId)"

echo "==> 2/4 Build ($SITE_URL)"
SITE_URL="$SITE_URL" npm run build

echo "==> 3/4 Upload to s3://$BUCKET"
# Fingerprinted assets first and never deleted, so a page cached a moment ago
# can still load the assets it references. Then everything else, revalidated
# on every request (CloudFront serves it; deploys invalidate it).
aws s3 sync dist/_astro "s3://$BUCKET/_astro" --cache-control "public, max-age=31536000, immutable"
aws s3 sync dist/icons "s3://$BUCKET/icons" --cache-control "public, max-age=604800" --delete
aws s3 sync dist "s3://$BUCKET" --delete \
  --exclude "_astro/*" --exclude "icons/*" --exclude "_redirects" \
  --cache-control "public, max-age=0, must-revalidate"

echo "==> 4/4 Invalidate CloudFront"
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*" --query "Invalidation.Id" --output text

echo "Deployed -> $SITE_URL"
