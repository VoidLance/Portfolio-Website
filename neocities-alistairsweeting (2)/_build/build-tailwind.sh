#!/bin/zsh
# Build Tailwind CSS from /tmp installation
cd /tmp/tailwind-install-neocities

# Update source files from WebDAV if they changed
cp "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/_build/tailwind.config.js" ./
cp "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/_build/src/styles/tailwind.css" ./src/styles/

# Copy HTML and JS files so Tailwind can scan them for classes
cp "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/"*.html ./ 2>/dev/null || true
cp -r "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/Games" ./ 2>/dev/null || true
cp -r "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/Software" ./ 2>/dev/null || true

# Build Tailwind (scanning all files in temp directory)
npx tailwindcss -i ./src/styles/tailwind.css -o ./dist/tailwind.css --minify


# Copy to style.css and dist/tailwind.css
cp ./dist/tailwind.css "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/style.css"
cp ./dist/tailwind.css "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/dist/tailwind.css"
echo "✓ Built and copied Tailwind CSS (with custom navbar styles) to WebDAV workspace"
