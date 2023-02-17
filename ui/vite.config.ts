import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

/**
 * @param {string | RegExp | Function} match
 *  String or RegExp to match the module id(file name),
 *  it also can be a matching-predicator with the signature `(this: vite transform context, code: string, id: file name string) => void`
 * @return transformed code
 */
import plainText from 'vite-plugin-plain-text';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: './../',
  build: {
    // generate manifest.json in outDir
    manifest: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: tag => tag.startsWith('discovery-') || tag.startsWith('warp-view-')
        }
      }
    }),
    // Add plain text support for .mc2 files
    plainText(/\.mc2$/),
  ],
  server: {
    port: 2000
  }
})

