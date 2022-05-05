/**
 * Bundles the widgets library, which is released independently of the interface application.
 * This library lives in src/lib, but shares code with the interface application.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { babel } = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')
const { default: dts } = require('rollup-plugin-dts')
const url = require('@rollup/plugin-url')
const svgr = require('@svgr/rollup')
const { default: multi } = require('rollup-plugin-multi-input')
const externals = require('rollup-plugin-node-externals')
const sass = require('rollup-plugin-scss')

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

/**
 * This exports scheme works for nextjs and for CRA5.
 *
 * It will also work for CRA4 if you use direct imports:
 *   instead of `import { SwapWidget } from '@uniswap/widgets'`,
 *              `import { SwapWidget } from '@uniswap/widgets/dist/index.js'`.
 * I do not know why CRA4 does not seem to use exports for resolution.
 *
 * Note that chunks are enabled. This is so the tokenlist spec can be loaded async,
 * to improve first load time (due to ajv). Locales are also in separate chunks.
 *
 * Lastly, note that JSON and lingui are bundled into the library, as neither are fully
 * supported/compatible with ES Modules. Both _could_ be bundled only with esm, but this
 * yields a less complex pipeline.
 */
const transpile = {
  input: 'src/index.tsx',
  external: isEthers,
  plugins: [
    // Dependency resolution
    externals({
      exclude: [
        'constants',
        /@lingui\/(core|react)/, // @lingui incorrectly exports esm, so it must be bundled in
        /\.json$/, // esm does not support JSON loading, so it must be bundled in
      ], // marks dependencies as external so they are not bundled inline
      deps: true,
      peerDeps: true,
    }),
    resolve({ extensions: EXTENSIONS }), // resolves third-party modules within node_modules/

    // Source code transformation
    replace({
      // esm requires fully-specified paths:
      'react/jsx-runtime': 'react/jsx-runtime.js',
      preventAssignment: true,
    }),
    json(), // imports json as ES6; doing so enables module resolution
    url({ include: ['**/*.png', '**/*.svg'], limit: Infinity }), // imports assets as data URIs
    svgr(), // imports svgs as React components
    sass({ output: 'dist/fonts.css', verbose: false }), // generates fonts.css
    commonjs(), // transforms cjs dependencies into tree-shakeable ES modules

    babel({
      babelHelpers: 'runtime',
      extensions: EXTENSIONS,
    }),
  ],
  onwarn: squelchTypeWarnings, // this pipeline is only for transpilation
}

const esm = {
  ...transpile,
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: false,
  },
}

const cjs = {
  ...transpile,
  output: {
    dir: 'dist/cjs',
    entryFileNames: '[name].cjs',
    chunkFileNames: '[name]-[hash].cjs',
    format: 'cjs',
    sourcemap: false,
  },
  watch: false,
}

const types = {
  input: 'dts/index.d.ts',
  output: { file: 'dist/index.d.ts' },
  external: (source) => source.endsWith('.scss'),
  plugins: [dts({ compilerOptions: { baseUrl: 'dts' } })],
  watch: false,
}

const locales = {
  input: 'src/locales/*.js',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: false,
    },
    {
      dir: 'dist/cjs',
      sourcemap: false,
    },
  ],
  watch: false,
  plugins: [commonjs(), multi()],
}

const assets = [
  {
    ...locales,
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: false,
    },
  },
]

const config = [esm, cjs, types, locales]
config.config = { ...esm, output: { ...esm.output, sourcemap: true } }
config.assets = assets
module.exports = config

function isEthers(source) {
  // @ethersproject/* modules are provided by ethers
  return source.startsWith('@ethersproject/')
}

function squelchTypeWarnings(warning, warn) {
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
  warn(warning)
}
