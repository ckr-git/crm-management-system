import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全局导入主题变量和 mixins，所有 .vue 和 .scss 文件都可以直接使用
        additionalData: `
          @import "@/styles/theme/variables.scss";
          @import "@/styles/theme/mixins.scss";
        `
      }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['**/*.stories.ts', 'node_modules/**', 'dist/**']
  },
  server: {
    port: 5174,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
