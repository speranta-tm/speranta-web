import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In dev, /api/* is proxied to the API so the client can use same-origin
    // relative URLs (no CORS, no hard-coded host). Deployed builds set
    // VITE_API_BASE instead; see src/lib/api.ts.
    //
    // Defaults to a local speranta-api (`dotnet run`, port 5280). Point it
    // elsewhere with SPERANTA_API_PROXY=https://… bun run dev
    proxy: {
      '/api': {
        target: process.env.SPERANTA_API_PROXY ?? 'http://localhost:5280',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
