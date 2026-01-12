#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the commit message from the most recent commit
const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();

// Skip if this is a merge commit or bot commit
if (commitMessage.startsWith('Merge') || commitMessage.includes('[bot]')) {
  console.log('⏭️  Skipping changelog update for merge/bot commit');
  process.exit(0);
}

// Get today's date in DD/MM/YY format
const today = new Date();
const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getFullYear()).slice(-2)}`;

// Read the Updates.jsx file
const filePath = path.join(__dirname, 'src/pages/Updates.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Split commit message into title and items (if multi-line)
const lines = commitMessage.split('\n').filter(l => l.trim());
const title = lines[0].replace(/'/g, "\\'");
const items = lines.slice(1).filter(l => l.trim()).map(item => item.replace(/'/g, "\\'"));

// Create the new update entry
let newEntry = `    {\n      date: '${dateStr}',`;

if (items.length === 0) {
  newEntry += `\n      items: [\n        '${title}'\n      ]`;
} else {
  newEntry += `\n      title: '${title}',\n      items: [\n        ${items.map(item => `'${item}'`).join(',\n        ')}\n      ]`;
}

newEntry += '\n    },';

// Find the updates array and insert the new entry
const updatesStart = content.indexOf('const updates = [');
const firstEntryStart = content.indexOf('{', updatesStart);

if (updatesStart !== -1 && firstEntryStart !== -1) {
  content = content.slice(0, firstEntryStart) + newEntry + '\n    ' + content.slice(firstEntryStart);
  fs.writeFileSync(filePath, content);
  console.log('✓ Updated Updates.jsx with new changelog entry');
  
  // Stage the updated file
  execSync('git add Website.code/src/pages/Updates.jsx');
  console.log('✓ Staged Updates.jsx for commit');
} else {
  console.error('✗ Could not find updates array in Updates.jsx');
  process.exit(1);
}
