import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // Так как мы тестируем серверный код (actions.ts)
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // Поддержка наших путей через @/
    },
  },
})
