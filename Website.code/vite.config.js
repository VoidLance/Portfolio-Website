import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure all assets get content hashes for proper cache busting
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // Force rebuild and hash generation
    cssCodeSplit: true,
    minify: 'terser',
    // Prevent caching issues by always generating new hashes
    sourcemap: false,
  },
  server: {
    open: true,
    port: 5173,
    middleware: [
      // Redirect old HTML files to React routes
      (req, res, next) => {
        const htmlFileMap = {
          '/blog.html': '/#/blog',
          '/3DModels.html': '/#/3d-models',
          '/Helpdesk.html': '/#/helpdesk',
          '/updates.html': '/#/updates',
          '/Games.html': '/#/games',
          '/Books.html': '/#/books',
          '/software.html': '/#/software',
        }
        
        if (htmlFileMap[req.url]) {
          res.statusCode = 301
          res.setHeader('Location', htmlFileMap[req.url])
          res.end()
        } else {
          next()
        }
      }
    ]
  }
})
