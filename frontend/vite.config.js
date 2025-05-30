import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true,
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        // target: import.meta.env.VITE_API_BASE_URL,
        changeOrigin: true,
      },
    },
  },
})
