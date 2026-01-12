#!/bin/zsh
# Watch mode: rebuild Tailwind CSS on changes
# Note: This watches the WebDAV HTML files but builds from /tmp
cd /tmp/tailwind-install-neocities

echo "Watching for changes... Press Ctrl+C to stop"
echo "Output will be copied to WebDAV workspace on each rebuild"
echo ""

# Use inotifywait if available, otherwise fall back to polling
if command -v inotifywait &> /dev/null; then
  while true; do
    npx tailwindcss -i ./src/styles/tailwind.css -o ./dist/tailwind.css --minify
    cp ./dist/tailwind.css "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/dist/tailwind.css"
    cp ./dist/tailwind.css "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/style.css"
    echo "✓ Rebuilt at $(date +%T)"
    
    inotifywait -r -e modify,create,delete "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/" \
      --exclude '(tailwind\.css|node_modules|\.git)' -q
  done
else
  # Fallback: use Tailwind's built-in watch
  npx tailwindcss -i ./src/styles/tailwind.css -o ./dist/tailwind.css --watch &
  TAILWIND_PID=$!
  
  # Copy output file periodically
  while kill -0 $TAILWIND_PID 2>/dev/null; do
    sleep 2
    if [ -f ./dist/tailwind.css ]; then
      cp ./dist/tailwind.css "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/dist/tailwind.css"
      cp ./dist/tailwind.css "/run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/style.css"
    fi
  done
fi
