# rolldown-plugin-dts-snapshot

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Unit Test][unit-test-src]][unit-test-href]

DTS snapshot plugin for Rolldown

## Install

```bash
npm i rolldown-plugin-dts-snapshot
```

## Usage

```ts
import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'
import { DtsSnapshot } from 'rolldown-plugin-dts-snapshot'

export default defineConfig({
  input: 'src/index.ts',
  plugins: [dts(), DtsSnapshot()],
})
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2025-PRESENT [Kevin Deng](https://github.com/sxzz)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/rolldown-plugin-dts-snapshot.svg
[npm-version-href]: https://npmjs.com/package/rolldown-plugin-dts-snapshot
[npm-downloads-src]: https://img.shields.io/npm/dm/rolldown-plugin-dts-snapshot
[npm-downloads-href]: https://www.npmcharts.com/compare/rolldown-plugin-dts-snapshot?interval=30
[unit-test-src]: https://github.com/sxzz/rolldown-plugin-dts-snapshot/actions/workflows/unit-test.yml/badge.svg
[unit-test-href]: https://github.com/sxzz/rolldown-plugin-dts-snapshot/actions/workflows/unit-test.yml
