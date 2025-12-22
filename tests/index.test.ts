import { expect, test } from 'vitest'
import { summary } from '../src/api.ts'

test('basic', () => {
  expect(
    summary(
      `
      interface Options {
        /** @default 10 */
        include?: any;
        str: "hello"
      }
      export function format(
        filePath: string,
        code: string, options?: Options): string;`,
    ),
  ).toMatchInlineSnapshot(`
    {
      "Options": "interface Options {
     include?: any
     str: 'hello'
    }",
      "format": "function format(_: string, _: string, _: Options): string",
    }
  `)
})
