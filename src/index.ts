import { writeFile } from 'node:fs/promises'
import { createFilter, type FilterPattern } from 'unplugin-utils'
import { snapshot } from './api.ts'
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
  includeNonExport?: boolean
  /**
   * @default '[cwd]/dts.snapshot.json'
   */
  saveTo?: string
}

export function DtsSnapshot({
  include = RE_DTS,
  exclude,
  includeNonExport = true,
  saveTo = 'dts.snapshot.json',
}: Options = {}): Plugin {
  const filter = createFilter(include, exclude)

  return {
    name: 'rolldown-plugin-dts-snapshot',
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
            chunk.preliminaryFileName
          ] = snapshot(chunk.code, chunk.fileName, {
            applyExportRename: chunk.isEntry,
          }))

          if (chunk.isEntry) {
            if (!includeNonExport) {
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
