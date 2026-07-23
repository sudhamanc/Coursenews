#!/usr/bin/env bash
#
# Deploy The Course Ledger to Netlify.
#
#   ./scripts/deploy.sh          deploy a draft preview
#   ./scripts/deploy.sh --prod   deploy to production
#
# Requires the project to be linked to a Netlify site first:
#   netlify login && netlify init      (new site)
#   netlify login && netlify link      (existing site)
#
# Remember to set ANTHROPIC_API_KEY (Functions scope) and enable Blobs in the
# Netlify UI — see the README "Deploy to Netlify" section.
#
set -euo pipefail
cd "$(dirname "$0")/.."

PROD=0
[ "${1:-}" = "--prod" ] && PROD=1

if [ -x "node_modules/.bin/netlify" ]; then NETLIFY="node_modules/.bin/netlify"; else NETLIFY="npx --yes netlify-cli"; fi

# Confirm the project is linked to a site.
if ! $NETLIFY status >/dev/null 2>&1; then
  echo "This project isn't linked to a Netlify site yet."
  echo "Run one of:"
  echo "  $NETLIFY login && $NETLIFY init   # create a new site"
  echo "  $NETLIFY login && $NETLIFY link   # connect an existing site"
  exit 1
fi

echo "Reminder: ANTHROPIC_API_KEY must be set (Functions scope) and Blobs enabled in Netlify."
echo

if [ "$PROD" = "1" ]; then
  echo "==> Deploying to PRODUCTION (build + functions)"
  $NETLIFY deploy --build --prod
else
  echo "==> Deploying a DRAFT preview (build + functions)"
  $NETLIFY deploy --build
fi
