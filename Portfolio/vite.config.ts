import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Portfolio/',
  build: {
    // three.js and friends only load with the lazy 3D room; splitting them lets the browser fetch the
    // pieces in parallel and keep them cached across deploys that only touch site code.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vite's dynamic-import helper is needed by the shell; left alone it lands in a 3D chunk
          if (id.includes('vite/preload-helper')) return 'react'
          if (!id.includes('node_modules')) return
          // React stays with the shell (first paint); without this it lands in the r3f chunk and drags three in eagerly
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return 'three'
          if (/postprocessing/.test(id)) return 'postprocessing'
          if (/@react-three|three-stdlib|troika|camera-controls|maath|zustand|suspend-react|its-fine/.test(id)) return 'r3f'
          if (/@pmndrs[\\/]assets/.test(id)) return 'hdri'
        },
      },
    },
  },
})
