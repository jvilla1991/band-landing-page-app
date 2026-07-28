import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // honor PORT when a tool assigns one (e.g. preview runners); default stays 5173
    port: Number(process.env.PORT) || 5173,
  },
})
