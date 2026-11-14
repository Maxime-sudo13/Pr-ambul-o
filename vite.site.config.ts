import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'site',
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  build: { outDir: '../dist/site', emptyOutDir: true },
})
