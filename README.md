# Portfolio Website

Personal portfolio website for showcasing projects, writing, games, and software work.

> ⚠️ Important for AI agents: read [`.cursorrules`](./.cursorrules) before making changes. It includes mandatory workflow requirements.

## Features

- Responsive, mobile-first interface across portfolio pages
- Single-page app navigation with React Router for fast transitions
- Dedicated portfolio areas for games, software, writing, and 3D work
- Live GitHub project integration for software listings
- Integrated helpdesk flow with AWS-backed ticket handling
- Automated AWS deployment workflow for fast publish cycles

## Repository Layout

- `Website.code/`: Main React application (active source of truth)
- `.github/`: Repository-level GitHub and Copilot instructions
- `AI_AGENT_GUIDE.md`: Agent onboarding notes for this repository

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
git clone https://github.com/VoidLance/Portfolio-Website.git
cd Portfolio-Website/Website.code
npm install
```

### Run Locally

```bash
npm run dev
```

## Build and Deploy

From `Website.code/`:

```bash
npm run build
npm run deploy:s3
```

The deployment target is AWS S3 + CloudFront.

## Architecture Summary

- Frontend: React + React Router + Tailwind CSS
- Build tooling: Vite
- Hosting: S3 + CloudFront
- Platform services: Route 53 + ACM + CloudWatch
- Helpdesk backend: API Gateway + Lambda + DynamoDB + Cognito + SES

## Engineering Highlights

- End-to-end ownership: frontend UI, backend APIs, infrastructure, and deployment
- Production cloud architecture on AWS with CDN delivery and managed platform services
- Serverless backend design for support workflows (authentication, ticket lifecycle, notifications)
- Operational maturity: cache invalidation flow, deployment automation, and monitoring hooks
- Maintainable project structure with reusable components and documented workflows

## Additional Docs

- [`Website.code/README.md`](./Website.code/README.md)
- [`Website.code/DEPLOYMENT.md`](./Website.code/DEPLOYMENT.md)
- [`Website.code/HELPDESK_AWS_SETUP.md`](./Website.code/HELPDESK_AWS_SETUP.md)

## License

MIT License. See [LICENSE](./LICENSE).
