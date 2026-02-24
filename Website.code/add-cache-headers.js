#!/usr/bin/env node
// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
// Post-build script to add cache-busting headers to index.html

import fs from "fs";
import path from "path";

const indexPath = path.join(process.cwd(), "dist", "index.html");

try {
  let content = fs.readFileSync(indexPath, "utf-8");

  // Check if cache headers are already present
  if (content.includes("Cache-Control")) {
    console.log("✓ Cache-busting headers already present in index.html");
    process.exit(0);
  }

  // Add cache-busting meta tags right after <head>
  const cacheHeaders = `    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">`;

  // Find the charset meta tag and insert after it
  content = content.replace(
    /(<meta charset="UTF-8">\n    <meta name="viewport"[^>]+>)/,
    `$1\n${cacheHeaders}`,
  );

  fs.writeFileSync(indexPath, content);
  console.log("✓ Cache-busting headers added to index.html");
} catch (error) {
  console.error("Error adding cache headers:", error);
  process.exit(1);
}
