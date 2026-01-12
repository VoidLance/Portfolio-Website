import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
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
