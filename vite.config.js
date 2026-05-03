import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo is served from https://<user>.github.io/vibecodedaislop/.
// Override at build time with `BASE_PATH=/ npm run build` for a custom domain.
const base = process.env.BASE_PATH ?? '/vibecodedaislop/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
