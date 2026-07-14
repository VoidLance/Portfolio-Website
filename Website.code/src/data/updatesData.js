// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
// Shared updates data used by both Sidebar and Updates page components

export const updatesData = [
  {
    date: "14/07/26",
    title: "Software Menu GitHub Shortcuts",
    items: [
      "Added dynamic project links to the Software page for all GitHub repositories under the VoidLance account, with expandable sections for each language and stack",
      "Added highlighted shortcut links to the Software menu for the most impressive projects",
      "Restored functionality of the Software menu to direct straight to the Software page with the GitHub list, and added a View All Projects item for quick access.",
    ]
  },
  {
    date: "16/05/26",
    title: "Semna: Shattered Cycles – Full Rulebook & Lore Overhaul",
    items: [
      "Renamed the game from \'Curse of Semna\' to \'Semna: Shattered Cycles\' across navigation, the Games page, and the rulebook page itself",
      "Rewrote all game content with the official lore: cosmic law, The Shattered Era, the Strategists & Fractured Cycles mechanic, and full faction profiles for 7 factions across two eras",
      "Replaced the old simplified win conditions (35 Energy loss) with the full tri-condition system: Historical Relapse, Energy Victory (30–34), Overload Loss (35+), and Effect Victory, with simultaneous resolution priority",
      "Overhauled deckbuilding rules: 50-card main deck, neutral faction cards, updated Artefact deck rules",
      "Rewrote the full turn structure (6 stages), combat, and energy/leyline bleeding mechanic",
      "Added comprehensive Keywords section: Ambush, Armour, Breach, Cleave, Decaying, Energise, Guardian, Heal, Level Down, Manifest, Sacrifice, Shift"
    ]
  },
  {
    date: "16/05/26",
    title: "Security Hardening - No Secrets Exposed",
    items: [
      "Removed sensitive data from serverless function logs to prevent accidental exposure of email addresses and message IDs",
      "Eliminated hardcoded personal email address fallback that could expose PII, now requires explicit environment variable configuration",
      "Verified client-side code only uses public-safe configuration values, never exposing privileged service credentials to browsers",
      "Added environment variable documentation for serverless functions with security best practices"
    ]
  },
  {
    date: "14/07/26",
    title: "Live GitHub Software Listings",
    items: [
      "Replaced the Software page's fixed GitHub project links with live repository data from the VoidLance GitHub account.",
      "Grouped repositories into expandable language and stack sections so the portfolio stays organized as new projects are pushed.",
      "Kept the featured showcase cards while making the GitHub list refresh automatically on each page load.",
    ]
  },
  {
    date: "30/04/26",
    title: "Legacy Hosting Cleanup + Git Push Fix",
    items: [
      "Removed legacy hosting references from the site content and project docs to align everything with AWS S3 + CloudFront hosting.",
      "Replaced the local pre-push deployment hook with the AWS deployment flow so pushes are no longer blocked by old deployment tooling.",
      "Removed obsolete hosting-specific project files and kept Website.code as the single deployment source of truth.",
      "Updated S3 sync exclusions to avoid uploading large development-only files from software subprojects during deploy.",
    ]
  },
  {
    date: "30/04/26",
    title: "S3 + CloudFront Deployment Workflow",
    items: [
      "Made Website.code the single source of truth for hosting updates by automating static asset packaging into dist.",
      "Added a one-command AWS deploy flow for S3 sync plus optional CloudFront invalidation, removing the need for manual flattening workflows.",
      "Documented exactly which folders are source-only versus static-host ready so future updates are safer and faster.",
    ]
  },
  {
    date: "30/04/26",
    title: "We're on AWS!",
    items: [
      "Migrated to AWS full-time",
      "Used CloudFront to host an S3 website for maximum performance and global CDN delivery",
      "Route 53 → CloudFront → S3 architecture provides custom domain management, HTTPS via ACM, edge caching, and near-zero hosting costs at scale"
    ]
  },
  {
    date: "24/02/26",
    title: "AI Agent Instructions & Code Quality",
    items: [
      "Added critical developer workflow instructions: AI agents now understand it's never a cache issue - changes are always hard refreshed with dev server auto-reload",
      "Fixed TypeScript errors in serverless backend functions with proper runtime configuration",
      "Added AI agent instruction comments to every code file directing to project guidelines",
    ],
  },
  {
    date: "24/02/26",
    title: "Mobile Navigation Menu Fix",
    items: [
      "Fixed burger menu to properly display all navigation items on mobile, following traditional mobile-first design patterns",
      "Ensured mobile menu styling doesn\'t affect desktop layout",
    ],
  },
  {
    date: "24/02/26",
    title: "Helpdesk Admin UX Refinements",
    items: [
      "Close ticket workflow now requires closing notes for better documentation and accountability",
      "Improved button interactions with proper cursor styling across admin panel",
    ],
  },
  {
    date: "24/02/26",
    title: "Full-Stack Helpdesk System",
    items: [
      "Built custom ticket management system with AWS backend services, real-time email notifications, and Kanban-style admin dashboard",
      "Implemented automated reply threading and internal notes - emails route through custom domain with proper Gmail integration",
      "Secured with authentication and access controls, optimized deployment from 3+ minutes to under 30 seconds",
    ],
  },
  {
    date: "24/02/26",
    title: "Dynamic GitHub Integration",
    items: [
      "Connected live GitHub API to dynamically fetch and display course projects from repository",
    ],
  },
  {
    date: "23/02/26",
    title: "Advanced SEO & Mobile UX",
    items: [
      "Engineered picture-in-picture modal system for blog posts with custom animations and blur effects",
      "Implemented JSON-LD structured data, semantic HTML5, and schema.org microdata for rich search results",
      "Completely rebuilt Pokemon Finder for mobile-first responsive design with collapsible panels and adaptive grid layouts",
    ],
  },
  {
    date: "12/01/26",
    title: "React Migration & Modern Architecture",
    items: [
      "Refactored entire site from vanilla HTML to React with component-based architecture and client-side routing",
      "Set up automated CI/CD pipeline with git hooks for streamlined static hosting deployment",
      "Migrated to Vite + Tailwind CSS v4 build system while preserving all legacy content",
    ],
  },
  {
    date: "12/01/26",
    title: "Game Projects Polish",
    items: [
      "Redesigned Curse of Semna info page with deep-linking and consolidated navigation",
      "Modernized Dungeon Crawler UI with glassmorphism effects and improved state management",
    ],
  },
  {
    date: "19/11/25",
    items: [
      "Built interactive tabbed interface for game rules with modern Tailwind styling",
      "Implemented translucent navbar overlay effect across site",
    ],
  },
  {
    date: "07/09/25",
    items: [
      "Created animated gradient background with scroll-based color transitions",
    ],
  },
  {
    date: "31/08/25",
    items: [
      "Fixed gallery page routing issues - learned valuable lesson about building from scratch vs AI generation",
    ],
  },
  {
    date: "29/08/25",
    items: [
      "Overhauled layout with fixed header, responsive sidebar positioning, and improved scroll behavior",
    ],
  },
  {
    date: "Beginning",
    items: [
      "Launched portfolio site with custom layout and multi-browser support (including Gemini protocol)",
    ],
  },
];
