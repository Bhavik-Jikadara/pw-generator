import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import manifest from './src/manifest.js'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'lib': path.resolve(__dirname, './src/lib'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      input: {
        popup: 'popup.html'
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'vendor-ui'
            }
            return 'vendor-utils'
          }
        },
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const extType = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name][extname]`
          }
          return `assets/[name][extname]`
        }
      }
    },
    sourcemap: mode === 'development'
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
      overlay: false,
    }
  },
  define: {
    'process.env': {},
  },
}))