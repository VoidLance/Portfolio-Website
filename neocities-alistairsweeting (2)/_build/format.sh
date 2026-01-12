#!/bin/zsh
# Format HTML/CSS/JS files with Prettier and prettier-plugin-tailwindcss
cd /tmp/tailwind-install-neocities

# Copy .prettierrc if it exists in WebDAV
if [ -f "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/.prettierrc" ]; then
  cp "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/.prettierrc" .
fi

echo "Formatting files in WebDAV workspace..."
npx prettier --write "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/**/*.{html,css,js}" \
  --ignore-path /dev/null \
  --log-level warn

echo "✓ Formatting complete"
