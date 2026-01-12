# Alistair Sweeting Portfolio - React Refactor

This website has been refactored from static HTML pages to a React-based single-page application (SPA) for improved performance and user experience.

## Key Improvements

✅ **No Full Page Reloads** - Navigation between pages is now instant using client-side routing with React Router
✅ **Improved Performance** - Shared components (Header, Footer, Navigation) are rendered once and reused
✅ **Better Maintainability** - Component-based architecture makes updating content easier
✅ **Modern Build Setup** - Uses Vite for fast development and optimized production builds
✅ **Tailwind CSS Integration** - Styling remains consistent with the original design

## Project Structure

```
/src
├── main.jsx              # React app entry point
├── App.jsx               # Main app component with routing
├── index.css             # Tailwind styles + global CSS
├── components/
│   ├── Header.jsx        # Header with background image
│   ├── Navigation.jsx    # Navigation menu with dropdowns
│   ├── Footer.jsx        # Footer with social links
│   ├── Sidebar.jsx       # Updates sidebar
│   └── PageWrapper.jsx   # Reusable page layout component
└── pages/
    ├── Home.jsx          # Home page
    ├── Games.jsx         # Games page
    ├── Blog.jsx          # Blog page
    ├── Books.jsx         # Books page
    ├── Helpdesk.jsx      # Help desk page
    ├── 3DModels.jsx      # 3D models page
    ├── Software.jsx      # Software page
    ├── Updates.jsx       # Updates page
    └── NotFound.jsx      # 404 page
```

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

3. Build for production:
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## Development

### Adding a New Page

1. Create a new file in `src/pages/YourPage.jsx`:

```jsx
import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function YourPage() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Your Page Title</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        {/* Your content here */}
      </article>
    </PageWrapper>
  )
}
```

2. Add route in `src/App.jsx`:

```jsx
import YourPage from './pages/YourPage'

<Route path="/your-page" element={<YourPage />} />
```

3. Add navigation link in `src/components/Navigation.jsx`:

```jsx
<li className="menu-item group relative">
  <Link to="/your-page" onClick={closeDropdown}>Your Page</Link>
</li>
```

### Styling

- All Tailwind classes use the custom `indie-*` color scheme defined in `tailwind.config.js`
- Custom CSS is in `src/index.css`
- Responsive design with `lg:` breakpoints for desktop layouts

## Key Features

### Client-Side Routing
All navigation uses React Router's `<Link>` component for instant page transitions without server requests.

### Scroll Effects
The gradient background angle changes as you scroll the page (original feature preserved).

### Responsive Design
The layout adapts to desktop and mobile with:
- Main content: 78% width on desktop, 100% on mobile
- Sidebar: Sticky on desktop, static on mobile

### Dropdown Menus
Hover interactions managed with React state for a smooth, responsive experience.

## Deployment

### For Neocities
1. Run `npm run build`
2. Upload the contents of the `dist/` folder to your Neocities site
3. Ensure your server supports client-side routing (may need `_redirects` or similar configuration)

### For Other Static Hosts
The built app is a standard static site and can be deployed to:
- GitHub Pages (with `vite.config.js` base path adjustment)
- Vercel
- Netlify
- Any static hosting service

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features used

## Future Enhancements

- Add blog post data structure
- Implement dynamic game listings
- Add contact form
- Create admin panel for content management
- Add analytics tracking
- Implement dark/light mode toggle

## Notes

- Existing games like Dungeon Crawler and Curse of Semna remain accessible via direct links
- External software projects (Personal Website, Pokemon Team Finder) open in new tabs
- All original styling and visual effects have been preserved
