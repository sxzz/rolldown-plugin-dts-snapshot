import { writeFile } from 'node:fs/promises'
import { createFilter, type FilterPattern } from 'unplugin-utils'
import { summary } from './api.ts'
import type { Plugin } from 'rolldown'

const RE_DTS = /\.d\.[cm]?ts$/

export interface Options {
  /**
   * @default /\.d\.[cm]?ts$/
   */
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * @default false
   */
  excludeNonExport?: boolean
  /**
   * @default 'dts-summary.json'
   */
  saveTo?: string
}

export function DtsSummary(options: Options = {}): Plugin {
  const {
    include = RE_DTS,
    exclude,
    excludeNonExport,
    saveTo = 'dts-summary.json',
  } = options
  const filter = createFilter(include, exclude)

  return {
    name: 'rolldown-plugin-dts-summary',
    async generateBundle(_, bundle) {
      const result: Record<
        string,
        Record<string, string | string[]>
      > = Object.create(null)

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'asset' || !filter(chunk.fileName)) continue

        result[chunk.fileName] = summary(
          chunk.code,
          chunk.fileName,
          chunk.isEntry && excludeNonExport
            ? (symbol) => chunk.exports.includes(symbol)
            : undefined,
        )
        if (chunk.isEntry) {
          result[chunk.fileName]['#exports'] = chunk.exports
        }
      }

      const code = `${JSON.stringify(result, null, 2)}\n`
      await writeFile(saveTo, code)
    },
  }
}
