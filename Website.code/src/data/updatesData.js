// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
// Shared updates data used by both Sidebar and Updates page components

export const updatesData = [
  {
    date: "24/02/26",
    title: "AI Agent Instructions & Code Quality",
    items: [
      "Added critical developer workflow instructions: AI agents now understand it's never a cache issue - changes are always hard refreshed with dev server auto-reload",
      "Fixed all TypeScript errors in Supabase edge functions with proper Deno runtime configuration",
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
      "Built custom ticket management system with Supabase backend, real-time email notifications, and Kanban-style admin dashboard",
      "Implemented automated reply threading and internal notes - emails route through custom domain with proper Gmail integration",
      "Secured with Row Level Security policies and authentication, optimized deployment from 3+ minutes to under 30 seconds",
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
      "Set up automated CI/CD pipeline with git hooks for instant Neocities deployment",
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
