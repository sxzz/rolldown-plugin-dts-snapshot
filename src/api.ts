import dprint from 'dprint-node'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { parseSync } from 'rolldown/experimental'
import type { Node, Span, TSTypeAnnotation } from '@oxc-project/types'

const multilineCommentsRE = /\/\*.*?\*\//gs
const singlelineCommentsRE = /\/\/.*$/gm

export function summary(
  code: string,
  fileName: string = 'dummy.d.ts',
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
      let code: string | undefined
      if (node.type === 'VariableDeclarator') {
        const typeAnnotation = (
          node.id.typeAnnotation as TSTypeAnnotation | null | undefined
        )?.typeAnnotation
        if (typeAnnotation) {
          code = s.slice(typeAnnotation.start, node.end)
        } else if (node.init) {
          code = slice(node.init)
        }
      }
      code ||= slice(node)

      const summary = format(code)
      result[symbol] = summary
    }

    if (decl.type === 'VariableDeclaration') {
      for (const node of decl.declarations) {
        register(nodeToString(node.id), node)
      }
    } else if ('id' in decl && decl.id) {
      register(nodeToString(decl.id), decl)
    } else if (
      // default export
      decl.type === 'ExportDefaultDeclaration' &&
      'id' in decl.declaration &&
      decl.declaration.id
    ) {
      register('default', decl.declaration)
    }
  }

  for (const stmt of program.body) {
    if (
      stmt.type === 'ExportNamedDeclaration' &&
      stmt.declaration === null &&
      stmt.specifiers.length
    ) {
      for (const specifier of stmt.specifiers) {
        const exported = nodeToString(specifier.exported)
        const local = nodeToString(specifier.local)
        if (local !== exported) {
          result[exported] = result[local]
        }
      }
    }
  }

  return result

  function nodeToString(node: Node) {
    return node.type === 'Identifier'
      ? node.name
      : node.type === 'Literal'
        ? (node.value as string)
        : slice(node)
  }
}

function format(code: string) {
  return dprint
    .format('dummy.d.ts', code, {
      lineWidth: 100000000,
      indentWidth: 1,
      semiColons: 'asi',
      preferSingleLine: true,
      'arrowFunction.useParentheses': 'force',
      quoteStyle: 'alwaysSingle',

      singleBodyPosition: 'sameLine',
      bracePosition: 'sameLine',
      operatorPosition: 'sameLine',
      preferHanging: true,
    })
    .trim()
    .replaceAll('\n\n', '\n')
}
