# Build Configuration

This folder contains all build-related files and configuration for the website.

## Scripts

- **build-tailwind.sh** - Compile Tailwind CSS from `/tmp` and copy to workspace
- **watch-tailwind.sh** - Watch mode for automatic rebuilding on file changes
- **format.sh** - Format HTML, CSS, JS, and JSON files with Prettier

## Configuration Files

- **tailwind.config.js** - Tailwind CSS configuration with custom colors and theme
- **postcss.config.js** - PostCSS configuration
- **package.json** - NPM dependencies for Tailwind and Prettier
- **.prettierrc** - Prettier formatting configuration

## Source Files

- **src/styles/tailwind.css** - Tailwind CSS source file with @tailwind directives

## Usage

To build Tailwind CSS:

```bash
cd /run/user/1000/gvfs/dav:host=neocities.org,ssl=true,prefix=%2Fwebdav/_build
./build-tailwind.sh
```

The compiled CSS will be output to:

- `/dist/tailwind.css` (referenced by most HTML files)
- `/style.css` (includes custom navbar styles for Dungeon Crawler)

## Note on WebDAV Limitations

Because the workspace is mounted over WebDAV (Neocities), `node_modules` cannot be installed here due to symlink restrictions. Instead, the build happens in `/tmp/tailwind-install-neocities` and files are copied back.
