import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015', // Toto zajistí, že kód bude srozumitelný i pro starší iPhony v aplikaci
  }
})