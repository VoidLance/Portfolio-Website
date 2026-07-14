# React Refactor Deployment Guide

## Primary Hosting Workflow (S3 + CloudFront)

The recommended workflow for this project is AWS S3 + CloudFront:

1. Work in this Website.code project only
2. Build to dist/
3. Deploy dist/ directly to S3 and invalidate CloudFront

Use these commands:

```bash
npm run build
npm run deploy:s3
```

For setup details, read `S3_CLOUDFRONT_WORKFLOW.md`.

For AWS helpdesk backend setup details, read `HELPDESK_AWS_SETUP.md`.

## Important: No Separate Flattened Workspace Required

This project now copies non-Vite static folders (Games and Images) into dist automatically during build.
That means dist is your complete deploy artifact for S3 static hosting.

## What Changed

My website has been refactored from static HTML pages to a React single-page application (SPA). This means:

✅ **No full page reloads** - Navigation is instant
✅ **Better performance** - Shared components load once
✅ **Same look & feel** - All original styling preserved
✅ **Better maintainability** - Easier to update content

## Installation & Development

### Quick Start

1. Make sure I have Node.js installed (https://nodejs.org/)

2. From the project directory, run:
```bash
npm install
npm run dev
```

3. Open http://localhost:5173 in my browser

## Building for Deployment

### Method 1: Using Build Script (Easiest)

```bash
chmod +x build.sh
./build.sh
```

### Method 2: Manual Build

```bash
npm install
npm run build
```

The optimized site is now in the `dist/` folder.

## Deploying to AWS S3 + CloudFront

### ✅ Automated Deployment (Current Setup)

My deployment is fully automated! Just push to GitHub:

```bash
git add .
git commit -m "My changes"
git push origin main  # This triggers automatic build & deploy!
```

The git pre-push hook (`.git/hooks/pre-push`) automatically:
1. Navigates to Website.code directory
2. Runs `npm run build` to create production files
3. Runs `npm run deploy:s3` to upload to my site
4. If any step fails, the push is aborted

**Live Site**: https://alistairsweeting.online

### Manual Deployment (If Needed)

1. Build my app:
```bash
cd Website.code
npm run build
```

2. Upload using AWS S3 + CloudFront CLI:
```bash
npm run deploy:s3
```

3. My site is now live!

**Note**: I'm using HashRouter (URLs like `/#/games`) because AWS S3 + CloudFront is a static host and doesn't support server-side routing.

## Important Notes

### Preserving Existing Pages

The old HTML files are still in the root directory. I can:
- Keep them for backup
- Delete them once I confirm the React version works
- Or ignore them if they're not being served

### Direct Game Links

Games like Dungeon Crawler still work at their original paths:
- `/Games/DungeonCrawler/index.html`
- `/Games/CurseSemna.html`

These are external to the React app and will cause a page reload when accessed.

### Browser History

React Router handles browser history automatically:
- Back/forward buttons work
- Bookmarks preserve the page
- Direct URL access works with HashRouter paths
- URLs use `/#/` routes for static hosting compatibility

## File Structure After Build

When I build with `npm run build`, the `dist/` folder contains:

```
dist/
├── index.html              # Main entry point
├── assets/
│   ├── index-xxxxx.js      # Main React bundle
│   ├── index-xxxxx.css     # Compiled styles
│   └── [other assets]
└── [other generated files]
```

Upload the entire `dist/` folder contents to my hosting.

## Troubleshooting

### Page not found on AWS S3 + CloudFront

AWS S3 + CloudFront is a static host and doesn't support server-side SPA route handling by default. This project already avoids that problem by using HashRouter (`/#/route`).

If I ever switch to BrowserRouter in the future, I would then need CloudFront/S3 fallback behavior for deep links.

1. **Option A**: Configure CloudFront custom error responses to serve `index.html` for SPA routes

2. **Option B**: Use a host with built-in SPA route fallback (Netlify/Vercel)

3. **Option C**: Keep hash-based routing (current setup in `src/App.jsx`):
```jsx
import { HashRouter as Router } from 'react-router-dom'
// Now URLs will be like /#/games instead of /games
```

### Styles not loading

Make sure the `dist/` folder has these files:
- `index.html`
- `assets/index-xxxxx.css`
- `assets/index-xxxxx.js`

All three are required for styling to work.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Check code style (if ESLint is installed)
```

## Future Updates

To update content, I'll edit the files in `src/pages/` and rebuild:

```bash
npm run build
```

Then I'll upload the new `dist/` folder.

## Keeping Original Files

The original static HTML files are still in the root:
- `index.html.bak` (if I backed it up)
- `Games.html`
- `blog.html`
- etc.

These won't interfere with the React app since they're not being served.

## Questions or Issues?

The main advantage of this setup is:
1. **Faster navigation** - No server round-trips
2. **Better UX** - Smooth transitions
3. **Easier updates** - Edit React components instead of HTML
4. **Modern tooling** - Vite for fast development

If I need to go back to static HTML, my original files are still there!
