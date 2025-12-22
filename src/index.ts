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
   * @default true
   */
  excludeNonExport?: boolean
  /**
   * @default '[cwd]/dts-summary.json'
   */
  saveTo?: string
}

export function DtsSummary(options: Options = {}): Plugin {
  const {
    include = RE_DTS,
    exclude,
    excludeNonExport = true,
    saveTo = 'dts-summary.json',
  } = options
  const filter = createFilter(include, exclude)

  return {
    name: 'rolldown-plugin-dts-summary',
    generateBundle: {
      order: 'post',
      async handler(_, bundle) {
        const result: Record<
          string,
          Record<string, string | string[]>
        > = Object.create(null)

        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'asset' || !filter(chunk.fileName)) continue

          const map: Record<string, string | string[]> = (result[
            chunk.fileName
          ] = summary(chunk.code, chunk.fileName))

          if (chunk.isEntry) {
            if (excludeNonExport) {
              for (const key of Object.keys(map)) {
                if (key !== '#exports' && !chunk.exports.includes(key)) {
                  delete map[key]
                }
              }
            }
            map['#exports'] = chunk.exports
          }
        }

        const code = `${JSON.stringify(result, null, 2)}\n`
        await writeFile(saveTo, code)
      },
    },
  }
}
