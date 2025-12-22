import dprint from 'dprint-node'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { parseSync } from 'rolldown/experimental'
import type { Node, Span } from '@oxc-project/types'

const multilineCommentsRE = /\/\*.*?\*\//gs
const singlelineCommentsRE = /\/\/.*$/gm

export function summary(
  code: string,
  fileName: string = 'dummy.d.ts',
  filter?: (symbol: string, summary: string) => boolean,
): Record<string, string> {
  code = code
    .replaceAll(multilineCommentsRE, '')
    .replaceAll(singlelineCommentsRE, '')
  const s = new MagicString(code)
  const slice = (node: Span) => s.slice(node.start, node.end)

  const { program } = parseSync(fileName, code)

  ;(walk as any)(program, {
    enter(node: Node, parent: Node, key: string) {
      if (key === 'params' && node.type === 'Identifier') {
        const end = node.typeAnnotation?.start ?? node.end
        s.overwrite(node.start, end, '_')
      }
    },
  })

  const result: Record<string, string> = Object.create(null)

  for (const stmt of program.body) {
    let decl: Node
    if (
      (stmt.type === 'ExportNamedDeclaration' ||
        stmt.type === 'ExportDefaultDeclaration') &&
      stmt.declaration
    ) {
      decl = stmt.declaration
    } else {
      decl = stmt
    }

    const register = (symbol: string, node: Node) => {
      const summary = format(slice(node))
      if (!filter || filter(symbol, summary)) {
        result[symbol] = summary
      }
    }

    if (decl.type === 'VariableDeclaration') {
      for (const node of decl.declarations) {
        register(slice(node.id), node)
      }
    } else if ('id' in decl && decl.id) {
      register(slice(decl.id), decl)
    } else if (
      // default export
      decl.type === 'ExportDefaultDeclaration' &&
      'id' in decl.declaration &&
      decl.declaration.id
    ) {
      register('default', decl.declaration)
    }
  }

  return result
}

function format(code: string) {
  return dprint
    .format('dummy.d.ts', code, {
      semiColons: 'asi',
      singleBodyPosition: 'sameLine',
      preferSingleLine: true,
      'arrowFunction.useParentheses': 'force',
    })
    .trim()
    .replaceAll('\n\n', '\n')
}
