import { defineConfig } from 'tsdown'
import { DtsSnapshot } from './src/index.ts'

export default defineConfig({
  entry: ['src/index.ts', 'src/api.ts'],
  platform: 'node',
  exports: true,
  inlineOnly: ['estree-walker'],
  plugins: [DtsSnapshot()],
})
