#!/usr/bin/env bash
#
# One-off move from Netlify: copies the Netlify Blobs stores the site still
# needs (the /latest feeds and edition archive, and saved chat threads) into
# the AWS data bucket. Daily rate-limit counters are not worth moving.
#
# Needs the Netlify CLI signed in with this folder linked to the site, and AWS
# credentials for the account the stack is deployed in. Safe to re-run: it
# overwrites the same keys.
#
set -euo pipefail
cd "$(dirname "$0")/.."

BUCKET="$(aws cloudformation describe-stacks --region us-east-1 --stack-name LatentInference \
  --query "Stacks[0].Outputs[?OutputKey=='DataBucketName'].OutputValue" --output text)"
WORK="$(mktemp -d)"
NETLIFY=(npx -y netlify-cli@26)

for store in news chat-threads; do
  keys="$("${NETLIFY[@]}" blobs:list "$store" --json | python3 -c 'import sys,json; [print(b["key"]) for b in json.load(sys.stdin)["blobs"]]')"
  count=0
  while IFS= read -r key; do
    [ -z "$key" ] && continue
    mkdir -p "$WORK/$store/$(dirname "$key")"
    "${NETLIFY[@]}" blobs:get "$store" "$key" -O "$WORK/$store/$key" >/dev/null
    count=$((count + 1))
  done <<<"$keys"
  echo "$store: $count blobs"
done

aws s3 sync "$WORK" "s3://$BUCKET" --content-type application/json
echo "Copied to s3://$BUCKET (staged in $WORK)"
