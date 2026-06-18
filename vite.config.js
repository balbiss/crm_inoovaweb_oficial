import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-charts': ['chart.js', 'vue-chartjs'],
          'vendor-ui': ['sweetalert2', 'lucide-vue-next'],
          'vendor-axios': ['axios'],
        }
      }
    }
  }
})
