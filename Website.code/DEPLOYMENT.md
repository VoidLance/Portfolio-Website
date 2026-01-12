# React Refactor Deployment Guide

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

## Deploying to Neocities

1. Build my app:
```bash
npm run build
```

2. Upload the contents of `dist/` to my Neocities account using:
   - The Neocities web uploader
   - Command line: `neocities push dist/*`
   - Or manually via FTP

3. My site is now live!

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
- Direct URL access works
- No `#` in URLs (clean routing)

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

### Page not found on Neocities

Neocities is a static host and doesn't support single-page app routing by default. I may need to:

1. **Option A**: Add a `_redirects` file to dist/ before uploading:
```
/* /index.html 200
```

2. **Option B**: Use a different host like Netlify or Vercel (they have built-in SPA support)

3. **Option C**: Use hash-based routing (edit `src/App.jsx`):
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
