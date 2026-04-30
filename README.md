# My Portfolio Website

My modern portfolio website showcasing my projects, skills, and experience.

> **⚠️ IMPORTANT FOR AI AGENTS**: Please read [`.cursorrules`](/.cursorrules) before making any changes. It contains mandatory requirements including changelog updates.

## Features

- Responsive design
- My project showcase
- Skills overview
- Contact information

## Getting Started
If, for whatever reason, you want to run this website yourself, you can do it using:

### Prerequisites

- Node.js (or my relevant runtime)

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

This repository is configured to deploy to AWS S3 + CloudFront using a git pre-push hook. When I push changes to GitHub, the hook automatically:

1. Builds the React app with Vite (creates optimized production bundle)
2. Syncs the dist/ folder contents to S3
3. Invalidates CloudFront cache for updated paths

```bash
git push origin main  # Automatically builds and deploys!
```

## Deployment Details

- **Local**: I make all my changes in this repository (React source in Website.code/)
- **Build**: Git hook runs `npm run build` to create optimized production files
- **Live**: Built files from dist/ automatically sync to AWS S3 + CloudFront at alistairsweeting.online
- **Status**: My GitHub repo and AWS-hosted site stay in sync with every push
- **Architecture**: React SPA with HashRouter for static hosting compatibility

## Technologies

- HTML5
- CSS3
- JavaScript
- AWS S3 + CloudFront

## License

MIT License - see LICENSE file for details
