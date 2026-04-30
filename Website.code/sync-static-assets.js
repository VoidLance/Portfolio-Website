#!/usr/bin/env node
// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
// Post-build script to copy non-Vite static directories into dist for static hosting.

import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");

const copyTargets = [
  { from: path.join(projectRoot, "Images"), to: path.join(distDir, "Images") },
  { from: path.join(projectRoot, "Games"), to: path.join(distDir, "Games") },
];

function copyDirectoryRecursive(fromPath, toPath) {
  if (!fs.existsSync(fromPath)) {
    console.log(`- Skipping missing directory: ${path.basename(fromPath)}`);
    return;
  }

  fs.rmSync(toPath, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(toPath), { recursive: true });
  fs.cpSync(fromPath, toPath, { recursive: true });
  console.log(`+ Copied ${path.basename(fromPath)} -> dist/${path.basename(toPath)}`);
}

try {
  if (!fs.existsSync(distDir)) {
    throw new Error("dist directory not found. Run the build step first.");
  }

  copyTargets.forEach(({ from, to }) => copyDirectoryRecursive(from, to));
  console.log("✓ Static asset sync complete");
} catch (error) {
  console.error("Error syncing static assets:", error.message);
  process.exit(1);
}
