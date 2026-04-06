import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          fileEditor: resolve(__dirname, 'src/preload/fileEditor.ts'),
          jsonFormatter: resolve(__dirname, 'src/preload/jsonFormatter.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@file-editor': resolve('src/renderer/file-editor/src'),
        '@json-formatter': resolve('src/renderer/json-formatter/src')
      }
    },
    plugins: [react()],
    server: {
      host: '0.0.0.0'
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          'file-editor': resolve(__dirname, 'src/renderer/file-editor/index.html'),
          'json-formatter': resolve(__dirname, 'src/renderer/json-formatter/index.html')
        }
      }
    }
  }
})
