import { nodeLib } from 'tsdown-preset-sxzz'
import { DtsSnapshot } from './src/index.ts'

export default nodeLib(
  { entry: ['src/{index,api}.ts'] },
  { plugins: [DtsSnapshot()] },
)
