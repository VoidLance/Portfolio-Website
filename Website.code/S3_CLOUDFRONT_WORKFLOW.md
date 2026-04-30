# S3 + CloudFront Workflow (Primary Hosting)

This project no longer needs a separate flattened deployment mirror for publishing.

Use Website.code as the source of truth:

- Edit source in src/
- Build with Vite
- Deploy dist/ directly to S3

## What Is Static-Host Ready vs Source-Only

Source-only (do not upload directly):

- src/
- package.json
- node_modules/
- vite.config.js
- scripts/

Static-host ready (upload result):

- dist/index.html
- dist/assets/* (hashed JS/CSS/images)
- dist/Software/* (from public/Software)
- dist/Images/* (copied from Images/ by sync-static-assets.js)
- dist/Games/* (copied from Games/ by sync-static-assets.js)
- dist/robots.txt
- dist/laws-cover.png

## Why Flattening Was Needed Before

Your old flattened deployment mirror folder was effectively a deployment snapshot.
That snapshot included built assets plus copied static folders (Games, Images, Software).

Now this is automatic:

1. Vite builds to dist/
2. add-cache-headers.js updates index.html cache metadata
3. sync-static-assets.js copies Games/ and Images/ into dist/

## One-Time Setup

1. Ensure AWS CLI is installed and authenticated.
2. Set environment variables:

bash:

```bash
export S3_BUCKET=your-site-bucket
export CLOUDFRONT_DISTRIBUTION_ID=YOUR_DIST_ID
```

fish:

```fish
set -x S3_BUCKET your-site-bucket
set -x CLOUDFRONT_DISTRIBUTION_ID YOUR_DIST_ID
```

You can also store these in your shell profile.

## Daily Workflow

1. Develop locally

```bash
npm run dev
```

1. Build and verify output

```bash
npm run build
```

1. Deploy to S3 + invalidate CloudFront

```bash
npm run deploy:s3
```

Optional dry run:

```bash
npm run deploy:s3:dry-run
```

## Cache Strategy Used by deploy-s3.sh

- assets/*: long cache (1 year, immutable) because files are hash-named
- index.html: no-cache so route shell updates are immediate
- other static files: short cache (5 minutes)

## Recommended Bucket/CloudFront Notes

- Keep S3 bucket private and use CloudFront Origin Access Control when possible.
- If using S3 website endpoint directly, ensure custom error handling routes unknown paths to index.html.
- Because the app uses HashRouter, deep-link routing is already static-host friendly.

## Migration Plan Away from a Flattened Mirror Folder

1. Treat Website.code as the only project you edit.
2. Stop manually copying files into a separate flattened mirror folder.
3. Use npm run deploy:s3 for all production updates.
4. Keep that old mirror folder only as an archive until you are fully confident.

## EC2 Future-Proofing

If you move to EC2 later, you can still reuse dist/ as the static artifact.
Only the final deploy target changes (S3 sync -> rsync/scp/container copy).
