import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'app',
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
  build: { outDir: '../dist/app', emptyOutDir: true },
})
