# React Refactor - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173 in my browser - I'll see my site with **zero page reloads** when navigating!

### 3. Deploy (Already Automated!)

My site is already set up for automatic deployment!

**Just push to GitHub**:
```bash
git push origin main  # Automatically builds and deploys!
```

**Or manually**:
```bash
npm run build
npm run deploy:s3
```

**Live at**: https://alistairsweeting.online

---

## 📁 Project Structure

```
alistairsweeting-portfolio/
│
├── src/
│   ├── main.jsx              ← React app entry point
│   ├── App.jsx               ← Router setup
│   ├── index.css             ← Tailwind + global styles
│   │
│   ├── components/           ← Reusable React components
│   │   ├── Header.jsx        
│   │   ├── Navigation.jsx    
│   │   ├── Footer.jsx        
│   │   ├── Sidebar.jsx       
│   │   └── PageWrapper.jsx   
│   │
│   └── pages/                ← Page components
│       ├── Home.jsx
│       ├── Games.jsx
│       ├── Blog.jsx
│       ├── Books.jsx
│       ├── Helpdesk.jsx
│       ├── 3DModels.jsx
│       ├── Software.jsx
│       ├── Updates.jsx
│       └── NotFound.jsx
│
├── index.html                ← Single HTML file (all content loads here)
├── vite.config.js            ← Build tool configuration
├── tailwind.config.js        ← Tailwind CSS configuration
├── postcss.config.js         ← PostCSS configuration
├── package.json              ← Dependencies & scripts
│
├── REACT_SETUP.md            ← Detailed React setup guide
├── DEPLOYMENT.md             ← Deployment instructions
└── [Original HTML files]     ← Still available as backup
```

---

## ✨ Key Benefits

| Feature | Before | After |
|---------|--------|-------|
| Page Reloads | Every navigation | None - instant! |
| Shared Header | Duplicated in every HTML | Renders once |
| Navigation | Full page reload | Instant transitions |
| Development | Edit HTML, rebuild | Edit JSX, auto-reload |
| Styling | Tailwind compilation | Vite + Tailwind |

---

## 🎨 Styling

All my original styling is preserved using Tailwind CSS with the custom `indie-*` color scheme:

```jsx
<h1 className="text-indie-accent-green">Title</h1>
<div className="bg-indie-bg-main border-indie-accent-pink">
  Content
</div>
```

---

## 📝 Adding New Pages

1. Create `src/pages/MyPage.jsx`:
```jsx
import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function MyPage() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green">My Page</h1>
      <p>Content here</p>
    </PageWrapper>
  )
}
```

2. Add route in `src/App.jsx`:
```jsx
<Route path="/my-page" element={<MyPage />} />
```

3. Add nav link in `src/components/Navigation.jsx`:
```jsx
<li className="menu-item group relative">
  <Link to="/my-page">My Page</Link>
</li>
```

Done! 🎉

---

## 🚢 Deployment Options

### AWS S3 + CloudFront
```bash
npm run build
# Upload dist/ folder to AWS S3 + CloudFront
```

### Netlify / Vercel
```bash
npm run build
# Connect my repo and auto-deploy
```

### Any Static Host
```bash
npm run build
# Upload dist/ folder
```

---

## 📱 Responsive Design

The site adapts to all screen sizes:
- **Desktop**: Main content 78%, sticky sidebar 18%
- **Tablet**: Responsive grid layout
- **Mobile**: Single column, sidebar becomes top section

---

## 🔄 What About Old Pages?

My original HTML files are still there. External games and projects still work:
- `/Games/DungeonCrawler/index.html` - Direct links work
- `/Software/Personal-Website/index.html` - Still accessible

---

## 💡 Tips

**Development**
```bash
npm run dev       # Auto-reload on file changes
npm run preview   # Test production build locally
```

**Styling**
- Colors: Edit `tailwind.config.js`
- Fonts: Already loaded from Google Fonts
- Breakpoints: Use `lg:` for desktop styles

**Navigation**
- Uses React Router - no hash (#) in URLs
- Browser back/forward works perfectly
- Bookmarks preserve the page

---

## 📖 Full Documentation

- [REACT_SETUP.md](./REACT_SETUP.md) - Detailed React setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [vite.config.js](./vite.config.js) - Build configuration
- [tailwind.config.js](./tailwind.config.js) - Styling configuration

---

## ❓ FAQ

**Q: Will page reloads happen?**
A: No! Navigation between pages is instant using React Router.

**Q: Can I go back to static HTML?**
A: Yes, my original HTML files are still there.

**Q: How do I add dynamic content?**
A: Fetch data in React components using hooks like `useEffect`.

**Q: Does this work on AWS S3 + CloudFront?**
A: Yes! See [DEPLOYMENT.md](./DEPLOYMENT.md) for any needed configuration.

**Q: Can I modify the design?**
A: Absolutely! Edit components in `src/` or styles in `tailwind.config.js`.

---

Happy coding! 🎉
