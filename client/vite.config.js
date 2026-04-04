import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This allows the server to be accessible over the local network (Wi-Fi)
    host: true, 
    // Setting a strict port ensures it doesn't jump to 5174 if 5173 is "busy"
    port: 5173,
    strictPort: true,
  }
})
