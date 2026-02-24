# AI Agent Onboarding Guide

This guide ensures AI agents (Claude, Copilot, etc.) understand project requirements before making changes.

## 🎯 Critical First Steps

1. **READ `.cursorrules`** - This file contains MANDATORY requirements for this project
   - Location: `/.cursorrules` (at repository root)
   - Contains: Changelog update requirements, code style, conventions

2. **Read this file** - You're reading it now! ✓

## ⚠️ CRITICAL: Never Assume Cache Issues

**IT IS NEVER A CACHE ISSUE.** The developer:
- Always hard refreshes (Ctrl+Shift+R / Cmd+Shift+R) after every change
- Often works on a dev server with automatic hot-reload
- Has browser cache disabled during development

**If changes aren't appearing:**
- Check for typos in code or class names
- Verify files were actually saved
- Check for JavaScript errors in console
- Ensure correct file paths and imports
- Verify build process completed successfully
- Check for CSS specificity issues
- Look for conflicting styles or logic

**DO NOT suggest:**
- "Try clearing your cache"
- "Hard refresh the page"
- "Clear browser storage"
- "Restart the dev server" (unless there's an actual error)

The issue is in the code, not the cache. Debug accordingly.

## 📋 Mandatory Requirements

### Changelog Updates
**EVERY code change must update the changelog** (except trivial comment fixes)

- **File**: `Website.code/src/data/updatesData.js`
- **When**: After completing any modifications
- **How**: Add entry to top of `updatesData` array
- **Format**: See `.cursorrules` for exact format specification

### Code Style
- Use React functional components with hooks
- Follow Tailwind CSS conventions already established
- Maintain existing naming patterns
- Use absolute imports where applicable

## 🏗️ Project Structure

```
Portfolio-Website/
├── .cursorrules              ← READ THIS FIRST
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   └── settings.json
├── Website.code/             ← React source code
│   ├── src/
│   │   ├── pages/           ← Page components
│   │   ├── components/      ← Reusable components
│   │   ├── data/            ← Shared data files (updatesData.js)
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Games/                    ← Static game assets
├── Software/                 ← Static software projects
└── Images/                   ← Static images
```

## 🔄 Typical AI Agent Workflow

1. Read `.cursorrules` at conversation start
2. Understand task requirements
3. Make code changes
4. **Update `Updates.jsx` with changelog entry** ← Don't forget!
5. Test changes if applicable
6. Summarize work completed

## 📝 Changelog Entry Checklist

- [ ] Used DD/MM/YY date format
- [ ] Entry is at TOP of updates array
- [ ] Title provided (if multiple changes)
- [ ] Changes are descriptive
- [ ] Proper grammar and complete sentences
- [ ] Single quotes escaped with `\'`
- [ ] Follows exact format from `.cursorrules`

## 🚀 Deployment Info

- **Automatic**: Git pre-push hook builds and deploys to Neocities
- **How**: Changes to GitHub are built with Vite and uploaded to Neocities
- **Result**: Website automatically updates when you push to main

## ❓ Common Questions

**Q: What counts as "code changes" requiring changelog?**
A: Any modification to functionality, UI, styling, or features. Minor typo fixes in comments don't require updates.

**Q: What if I forgot to update the changelog?**
A: Add it immediately. The changelog should accurately reflect all work done on the project.

**Q: Where exactly do I add the changelog entry?**
A: Right after `export const updatesData = [` at the start of the array in `Website.code/src/data/updatesData.js`.

**Q: What format should the date be?**
A: DD/MM/YY (e.g., '12/01/26' for January 12, 2026)

---

**Updated**: 12/01/26  
**Applies to**: All AI agents (Claude, GitHub Copilot, Cursor, etc.)
