// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
// Shared updates data used by both Sidebar and Updates page components

export const updatesData = [
  {
    date: "24/02/26",
    title: "Helpdesk Notifications",
    items: [
      "Send assignment notification emails whenever the ticket assignee changes, including self-assignments",
      "Notify assignees by email when a customer reply updates their ticket",
    ],
  },
  {
    date: "24/02/26",
    title: "Helpdesk Email Configuration",
    items: [
      "Updated Edge Function to send emails from helpdesk@alistairsweeting.online with Gmail as reply-to",
      "Simplified email configuration - only Resend API key required",
      "Separated internal notes from email replies with distinct UI and functionality",
    ],
  },
  {
    date: "24/02/26",
    title: "Helpdesk Admin Kanban + Replies",
    items: [
      "Redesigned the helpdesk admin dashboard into a Kanban view with Open, Assigned to Me, and Closed columns",
      "Added assignment controls so tickets can be assigned to the current admin or any user email",
      "Implemented ticket detail panel with conversation history and reply composer",
      "Replies can be sent as email or stored as internal notes, with all replies tracked in a new ticket_replies table",
      "Added Edge Function scaffolding for outbound email replies and inbound reply webhooks",
    ],
  },
  {
    date: "24/02/26",
    title: "Helpdesk Insert Fix",
    items: [
      "Removed post-insert row selection in Helpdesk form to avoid requiring anon SELECT policy",
      "Helpdesk submissions now rely only on INSERT permissions for public users",
    ],
  },
  {
    date: "24/02/26",
    title: "Supabase Key Fix",
    items: [
      "Switched Supabase client to prefer the anon public JWT for database access",
      "Updated env templates and setup guide to use the anon public key",
      "Removed duplicate env entries to prevent key resolution issues",
    ],
  },
  {
    date: "24/02/26",
    title: "Supabase Key Naming Update",
    items: [
      "Switched Supabase config to use the publishable key naming convention",
      "Updated environment templates and setup guide to match publishable key usage",
      "Kept backward compatibility by supporting the legacy anon key name",
    ],
  },
  {
    date: "24/02/26",
    title: "Helpdesk System with Supabase Backend",
    items: [
      "Integrated Supabase database for storing helpdesk tickets with secure backend",
      "Added ticket submission form that saves inquiries to cloud database with status tracking",
      "Created admin dashboard (/#/helpdesk/admin) with authentication for viewing and managing tickets",
      "Admin can mark tickets as open/closed, view all submissions with timestamps, and reply via email links",
      "Implemented Row Level Security (RLS) policies - public can submit tickets, only authenticated admins can view/edit",
      "Added success/error feedback messages for form submissions",
      "Created comprehensive setup guide (SUPABASE_SETUP.md) with database schema and security configuration",
    ],
  },
  {
    date: "24/02/26",
    title: "Software Page GitHub Integration",
    items: [
      "Added collapsible GitHub integration to Software page displaying course projects from VoidLance/Course-Files repository",
      "Fetches and displays all JavaScript and React subfolder projects dynamically from GitHub API",
      "Course projects section is collapsed by default and visually de-emphasized compared to featured projects",
      "Projects displayed in compact grid layout with category labels and direct links to GitHub folders",
    ],
  },
  {
    date: "24/02/26",
    title: "UX Improvements",
    items: [
      "Fixed dropdown menu hover behavior by adding invisible bridge between menu items and dropdown menus",
      "Dropdowns now remain open when mouse travels through the visual gap, improving usability without changing appearance",
    ],
  },
  {
    date: "24/02/26",
    title: "Deployment Optimization",
    items: [
      "Fixed slow git push pre-push hook by removing unnecessary node_modules and source files from deployment",
      "Created automated cleanup script that removes node_modules, .next directories, TypeScript source files, and config files from dist folder before deployment",
      "Added proper error handling to pre-push hook - git push now fails if Neocities deployment fails",
      "Reduced deployment time from several minutes to under 30 seconds by excluding thousands of unnecessary files",
      "Deployment now only uploads essential production files (HTML, CSS, JS, images) instead of entire development dependencies",
    ],
  },
  {
    date: "23/02/26",
    title: "Blog Post Modal & Enhanced SEO",
    items: [
      "Implemented picture-in-picture style modal overlay for reading full blog posts without leaving the page",
      "Added full post content to article elements (hidden by default) for improved SEO indexing",
      "Created smooth fade-in and scale-in animations for modal appearance",
      "Modal displays complete blog post with proper formatting, metadata, and link to original Blogger post",
      "Background page remains visible and blurred underneath modal for better user context",
      "Added comprehensive styling for blog post content: headings, links, images, code blocks, blockquotes, and lists",
      "Modal is fully responsive with max height constraints and smooth scrolling on mobile devices",
      "Close button positioned at top-right with hover effects and keyboard accessibility",
      "Full article body included with itemProp='articleBody' for schema.org BlogPosting compliance",
    ],
  },
  {
    date: "23/02/26",
    title: "Pokemon Finder Mobile Optimization",
    items: [
      "Completely redesigned Pokemon Finder app layout for mobile devices with vertical stacking instead of horizontal sidebars",
      "Added collapsible search panels on mobile with toggle buttons and animated icons for better space utilization",
      "Implemented responsive grid system: single column on mobile, two columns on tablets, three columns on desktop",
      "Enlarged Pokemon card images and improved type badge readability on mobile screens (160px sprites vs 120px)",
      "Optimized Team Builder modal for mobile with reduced padding, smaller text sizes, and 3-column generation filters",
      "Enhanced mobile responsiveness in comparison grids, stat bars, and team recommendation displays",
      "Fixed overflow issues that previously hid Pokemon details on mobile devices",
      "Made Pokemon data the primary focus on mobile by reordering layout sections with CSS order property",
      "Added responsive breakpoints at 480px, 768px, and 1024px for optimal display across all device sizes",
    ],
  },
  {
    date: "23/02/26",
    title: "Mobile Optimization & Blog SEO Enhancement",
    items: [
      "Implemented responsive mobile hamburger menu with toggle functionality for navigation dropdowns",
      "Upgraded header responsiveness using clamp() to scale from 120px to 192px based on viewport size",
      "Added comprehensive responsive text sizes across all pages using sm: and md: breakpoints (text-2xl → text-4xl progression)",
      "Optimized padding and spacing for mobile devices with responsive variants (p-4 sm:p-5 md:p-6)",
      "Converted blog posts from plain divs to semantic HTML5 article elements with header, footer, and time tags",
      "Added JSON-LD structured data for blog pages (BlogPosting and ItemList schemas) to improve search engine visibility",
      "Integrated blog post metadata (author, published date in ISO format) from Blogger API for SEO value",
      "Enhanced blog post display with proper microdata attributes (itemScope, itemType, itemProp) for rich snippets",
      "Improved meta tag management for blog page with description and OpenGraph tags",
      "Updated Navigation component with responsive menu styling and touch-friendly dropdown interactions",
      "Maintained Blogger API integration while making blog posts contributes directly to site SEO",
    ],
  },
  {
    date: "12/01/26",
    title: "Curse of Semna & Dungeon Crawler UX Improvements",
    items: [
      "Enhanced Curse of Semna page by consolidating 10+ tabs into 4 main categories (Overview, Gameplay, Cards, Reference) with intuitive icons",
      "Implemented deep-linking support for direct navigation to specific sections via URL parameters and anchor tags",
      "Restored Dungeon Crawler game with modern UI refinements: compact single-line title, color-matched class selection borders, and fixed-height scrollable log panel",
      "Added player class display in stats panel and improved class card styling with glassmorphism effects and dynamic color glows",
      "Fixed numerous display issues including vampire badge visibility, list bullet formatting, and button spacing in class selection",
    ],
  },
  {
    date: "12/01/26",
    title: "Consolidate Changelog to Shared Data File",
    items: [
      "Removed redundant Updates.jsx page component from router",
      "Created centralized updatesData.js for all changelog entries",
      "Updated AI_AGENT_GUIDE.md and .cursorrules to point to shared data file",
      "All updates now maintained in single source of truth accessible to Sidebar",
      "Simplified architecture - sidebar is the only place updates are displayed",
    ],
  },
  {
    date: "12/01/26",
    title: "AI Agent Instructions & Tab Title Improvements",
    items: [
      "Added AI_AGENT_GUIDE.md instructions comment to all page files to guide future AI agents",
      "Updated Curse of Semna tab titles to be shorter and more meaningful when truncated by button size",
    ],
  },
  {
    date: "12/01/26",
    title: "Curse of Semna Game Rules Expansion",
    items: [
      "Integrated comprehensive game information from design document into Curse of Semna page",
      "Added 10 new tabbed sections: Story, How to Win, Game Setup, Turn Structure, Combat & Attacking, Energy System, Card Types & Roles, Deckbuilding Rules, Playmat Zones, and Game Glossary",
      "Included full gameplay mechanics, core rules, and terminology definitions",
      "Removed all planning/design notes to keep only practical game information for players",
    ],
  },
  {
    date: "12/01/26",
    title: "Updates Section Layout Improvements",
    items: [
      "Increased updates sidebar width from 18% to 25% for better readability",
      "Reduced gap between updates sidebar and main content from 20px to 8px",
      "Adjusted minimum width to 320px to support the wider layout",
    ],
  },
  {
    date: "12/01/26",
    title: "React Deployment & Neocities Integration",
    items: [
      "Successfully deployed React site to Neocities with HashRouter for static hosting compatibility",
      "Configured automated git pre-push hook to build and deploy on every GitHub push",
      "Fixed MIME type issues by properly uploading dist folder instead of source files",
      "Updated all documentation files to first person perspective for personal use",
      "Site now features instant navigation with zero page reloads while maintaining all original design",
    ],
  },
  {
    date: "12/01/26",
    title: "React Refactor Complete",
    items: [
      "Refactored website from vanilla HTML to React with React Router for better component management",
      "Migrated styling from plain Tailwind to Vite + Tailwind CSS v4 with PostCSS",
      "Updated all pages to use React components for easier maintenance and updates",
      "Preserved all historical content and styling from previous version",
    ],
  },
  {
    date: "19/11/25",
    items: [
      "Upgraded Curse of Semna page with modern Tailwind styling and interactive tabbed interface for game rules",
      "Integrated header image with navbar across all pages - navbar now overlays the bottom of the header image with translucent background",
      "Added visual current page markers with gray text and green underline for better navigation clarity",
      "Fixed numerous WebDAV filesystem issues during the modernization process",
    ],
  },
  {
    date: "07/09/25",
    items: [
      "Changed background a few times, settled on a texture with an animated gradient",
      "Added a scroll effect to the gradient so it changes as you scroll down the page",
      "Changed the header image to a more abstract one that fits the new background better",
      "Corrected some bad html on some pages",
    ],
  },
  {
    date: "06/09/25",
    items: [
      "Added some more socials",
      "Updated footer styling",
      "Moved footer from separate html file to inline HTML",
    ],
  },
  {
    date: "03/09/25",
    items: [
      "Added bluesky link",
      "Made the footer a separate html file like the updates section, so it can be called on new pages and updated easily",
      "Changed the font of the personal website for the course",
      "Changed some styling, including some advanced CSS for the footer",
    ],
  },
  {
    date: "01/09/25",
    items: [
      "Made further adjustments to the gallery layout for better responsiveness",
    ],
  },
  {
    date: "31/08/25",
    items: [
      "Finally fixed the issue with the gallery page not updating by renaming the file paths",
      "Spent way too long messing around with an AI built site only to realise I can build it better",
      "Also spent way too long trying to get the gallery page on the Personal Site working",
    ],
  },
  {
    date: "30/08/25",
    items: [
      "Added some box shadows and rounded corners to the main content and sidebar",
      "Added a border around the main content area to make it stand out more",
      "Added a box shadow to the header area to give it some depth",
    ],
  },
  {
    date: "29/08/25",
    items: [
      "Changed a bunch of CSS to make the site scroll better with a fixed header and a better looking navbar",
      "Changed the updates section to appear on the very far left on larger screens, but underneath the main content on smaller screens",
    ],
  },
  {
    date: "27/08/25",
    items: [
      "Updated CSS to comply with standards expected on software dev course",
      "Updated all links on homepage to open in new tab",
      "Added horizontal bars for visual separation",
      'Removed the "Hi There!" bit that had become weirdly placed',
      "Updated the copyright licensing message",
    ],
  },
  {
    date: "21/08/25",
    items: [
      "Posthumously added completed tasks to this list",
      "Added a page to games/CurseofSemna so that it no longer links to a non-existent page",
      "Added photography portfolio links to home page",
      "Updated the blog",
    ],
  },
  {
    date: "Unknown",
    items: [
      "Deleted test page",
      "Added helpdesk and 3D Models pages",
      "Added submenu functionality to the Games link",
    ],
  },
  {
    date: "Beginning",
    items: [
      "Used sadgrl's layout tool",
      "Wrote beginning content",
      "Added test page to ensure links are working",
      "Linked to gemini page for gemini browser users",
    ],
  },
];
