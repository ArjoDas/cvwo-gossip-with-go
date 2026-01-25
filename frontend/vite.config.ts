import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // The Go Backend
        changeOrigin: true,               // changes Host header of vite's http request to target
        rewrite: (path) => path.replace(/^\/api/, ''),  // Removes '/api' before sending to Go    
      },
    },
  },
})
