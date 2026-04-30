#!/usr/bin/env bash
set -euo pipefail

if [ -z "${S3_BUCKET:-}" ]; then
  echo "Missing required env var: S3_BUCKET"
  exit 1
fi

if [ ! -d "dist" ]; then
  echo "dist directory not found. Run npm run build first."
  exit 1
fi

if [ "${DRY_RUN:-0}" = "1" ]; then
  DRY_RUN_FLAG="--dryrun"
  echo "Running in dry-run mode"
else
  DRY_RUN_FLAG=""
fi

echo "Syncing non-asset files to s3://${S3_BUCKET}"
aws s3 sync dist "s3://${S3_BUCKET}" \
  --delete \
  --exclude "assets/*" \
  --exclude "Software/*/node_modules/*" \
  --exclude "Software/*/*/node_modules/*" \
  --exclude "Software/*/.next/*" \
  --exclude "Software/*/.env*" \
  --exclude "Software/*/package*.json" \
  --exclude "Software/*/bun.lock" \
  --exclude "Software/*/tsconfig.json" \
  --exclude "Software/*/*.config.*" \
  --exclude "Software/*/README.md" \
  --cache-control "public,max-age=300" \
  ${DRY_RUN_FLAG}

echo "Syncing hashed assets to s3://${S3_BUCKET}/assets"
aws s3 sync dist/assets "s3://${S3_BUCKET}/assets" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  ${DRY_RUN_FLAG}

echo "Forcing index.html to no-cache"
aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
  --cache-control "no-cache,no-store,must-revalidate,max-age=0" \
  --content-type "text/html" \
  ${DRY_RUN_FLAG}

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "(dryrun) Would invalidate CloudFront distribution ${CLOUDFRONT_DISTRIBUTION_ID:-<not set>}"
elif [ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]; then
  echo "Creating CloudFront invalidation"
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/index.html" "/assets/*" "/Images/*" "/Games/*" "/Software/*" "/robots.txt" "/laws-cover.png"
else
  echo "CLOUDFRONT_DISTRIBUTION_ID not set; skipping invalidation"
fi

echo "S3 deploy completed"
