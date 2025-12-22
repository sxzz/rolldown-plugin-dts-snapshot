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
        code: string, options?: Options): string;
      const foo = 42;
      const bar: typeof foo
      export { format as "module.exports" }`,
    ),
  ).toMatchInlineSnapshot(`
    {
      "Options": "interface Options {
     include?: any
     str: 'hello'
    }",
      "bar": "typeof foo",
      "foo": "42",
      "format": "function format(_: string, _: string, _: Options): string",
      "module.exports": "function format(_: string, _: string, _: Options): string",
    }
  `)
})
