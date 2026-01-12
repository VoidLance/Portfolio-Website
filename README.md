# My Portfolio Website

My modern portfolio website showcasing my projects, skills, and experience.

## Features

- Responsive design
- My project showcase
- Skills overview
- Contact information

## Getting Started

### Prerequisites

- Node.js (or my relevant runtime)
- Neocities CLI

### Installation

```bash
git clone https://github.com/myusername/Portfolio-Website.git
cd Portfolio-Website
npm install
```

### Development

```bash
npm run dev
```

### Deployment

This repository is configured to automatically deploy to my Neocities site using a git pre-push hook and the Neocities CLI. When I push changes to GitHub, the hook automatically:

1. Builds the React app with Vite (creates optimized production bundle)
2. Uploads the dist/ folder contents to Neocities
3. Maintains all static assets (Games, Software folders)

```bash
git push origin main  # Automatically builds and deploys!
```

## Deployment Details

- **Local**: I make all my changes in this repository (React source in Website.code/)
- **Build**: Git hook runs `npm run build` to create optimized production files
- **Live**: Built files from dist/ automatically sync to Neocities at alistairsweeting.online
- **Status**: My GitHub repo and Neocities site stay in sync with every push
- **Architecture**: React SPA with HashRouter for static hosting compatibility

## Technologies

- HTML5
- CSS3
- JavaScript
- Neocities

## License

MIT License - see LICENSE file for details