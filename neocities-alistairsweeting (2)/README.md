# Neocities Website

Personal website hosted on Neocities with custom Tailwind CSS styling.

## Directory Structure

```plaintext
/
├── index.html              # Home page
├── style.css               # Compiled Tailwind CSS + custom styles
├── 3DModels.html           # 3D models showcase
├── blog.html               # Blog page
├── Books.html              # Books page
├── Games.html              # Games listing page
├── Helpdesk.html           # Help desk page
├── software.html           # Software showcase
├── updates.html            # Updates/changelog
├── not_found.html          # 404 error page
│
├── dist/
│   └── tailwind.css        # Compiled Tailwind CSS (referenced by most pages)
│
├── Books/                  # Book-related content
├── Games/                  # Game projects
│   ├── CurseSemna.html     # Curse of Semna tabletop game
│   └── DungeonCrawler/     # Dungeon Crawler web game
│       ├── index.html
│       └── script.js
│
├── Images/                 # Image assets
├── Software/               # Software projects
│
├── _build/                 # Build configuration & scripts
│   ├── README.md           # Build documentation
│   ├── build-tailwind.sh   # Compile Tailwind CSS
│   ├── watch-tailwind.sh   # Watch mode for development
│   ├── format.sh           # Code formatter
│   ├── package.json        # NPM dependencies
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── postcss.config.js   # PostCSS configuration
│   ├── .prettierrc         # Prettier configuration
│   └── src/
│       └── styles/
│           └── tailwind.css # Tailwind source
│
└── _archive/               # Archived/backup files
    ├── README.md
    ├── test.html
    ├── blog-backup.html
    ├── Template.html
    └── CurseofSemna.html   # Old version

```

## Development

### Building CSS

```bash
cd _build
./build-tailwind.sh
```

This compiles Tailwind CSS from `/tmp/tailwind-install-neocities` (due to WebDAV limitations) and outputs to:

- `/dist/tailwind.css` - Referenced by most HTML pages
- `/style.css` - Includes custom navbar styles for Dungeon Crawler

### Watch Mode

```bash
cd _build
./watch-tailwind.sh
```

### Code Formatting

```bash
cd _build
./format.sh
```

## Theme

Custom color palette defined in `_build/tailwind.config.js`:

- **Background**: Deep purples (#181820, #2f085e, #241445, #13092D)
- **Accents**: Neon green (#43ea7c), Pink (#ED64F5), Purple (#4b0c75)
- **Text**: Light shades (#fceaff, #e6e6e6)

## Notes

- `node_modules/` exists but cannot be properly used due to WebDAV symlink restrictions
- All NPM operations happen in `/tmp/tailwind-install-neocities`
- Files prefixed with `_` are not served by Neocities
