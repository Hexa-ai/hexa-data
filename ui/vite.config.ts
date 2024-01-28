import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

/**
 * @param {string | RegExp | Function} match
 *  String or RegExp to match the module id(file name),
 *  it also can be a matching-predicator with the signature `(this: vite transform context, code: string, id: file name string) => void`
 * @return transformed code
 */
import plainText from 'vite-plugin-plain-text'

// https://vitejs.dev/config/
export default defineConfig({
  envDir: './../',
  build: {
    // generate manifest.json in outDir
    manifest: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.startsWith('discovery-') || tag.startsWith('warp-view-'),
        },
      },
    }),
    // Add plain text support for .mc2 files
    plainText(/\.mc2$/),
  ],
  server: {
    host: process.env.VITE_HOST || '127.0.0.1',
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 2000,
    cors: true,
  },
})
