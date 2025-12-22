import { defineConfig } from 'tsdown'
import { DtsSummary } from './src/index.ts'

export default defineConfig({
  entry: ['src/*.ts'],
  platform: 'node',
  exports: true,
  inlineOnly: [],
  plugins: [DtsSummary()],
})
