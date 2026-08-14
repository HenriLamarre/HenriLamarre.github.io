import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// User site (henrilamarre.github.io) is served from the domain root,
// so no `base` override is needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
