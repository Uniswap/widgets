/**
 * Bundles the widgets library, which is released independently of the interface application.
 * This library lives in src/lib, but shares code with the interface application.
 */

const { babel } = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')
const typescript = require('@rollup/plugin-typescript')
const url = require('@rollup/plugin-url')
const svgr = require('@svgr/rollup')
const path = require('path')
const copy = require('rollup-plugin-copy')
const del = require('rollup-plugin-delete')
const { default: dts } = require('rollup-plugin-dts')
const { default: multi } = require('rollup-plugin-multi-input')
const externals = require('rollup-plugin-node-externals')
const sass = require('rollup-plugin-scss')

const REPLACEMENTS = {
  // esm requires fully-specified paths:
  'react/jsx-runtime': 'react/jsx-runtime.js',
}

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']
const ASSET_EXTENSIONS = ['.png', '.svg']
function isAsset(source) {
  const extname = path.extname(source)
  return extname && [...ASSET_EXTENSIONS, '.css', '.scss'].includes(extname)
}

function isEthers(source) {
  // @ethersproject/* modules are provided by ethers
  return source.startsWith('@ethersproject/')
}

const plugins = [
  // Dependency resolution
  resolve({ extensions: EXTENSIONS }), // resolves third-party modules within node_modules/

  // Source code transformation
  replace({ ...REPLACEMENTS, preventAssignment: true }),
  json(), // imports json as ES6; doing so enables type-checking and module resolution
]

const check = {
  input: 'src/index.tsx',
  output: { file: 'dist/widgets.tsc', inlineDynamicImports: true },
  external: (source) => isAsset(source) || isEthers(source),
  plugins: [
    externals({ exclude: ['constants'], deps: true, peerDeps: true }), // marks builtins, dependencies, and peerDependencies external
    ...plugins,
    typescript({ tsconfig: './tsconfig.json' }),
  ],
  onwarn: squelchTranspilationWarnings, // this pipeline is only for typechecking and generating definitions
}

const type = {
  input: 'dist/dts/index.d.ts',
  output: { file: 'dist/index.d.ts' },
  external: (source) => isAsset(source) || isEthers(source),
  plugins: [
    externals({ exclude: ['constants'], deps: true, peerDeps: true }),
    dts({ compilerOptions: { baseUrl: 'dist/dts' } }),
    process.env.ROLLUP_WATCH ? undefined : del({ hook: 'buildEnd', targets: ['dist/widgets.tsc', 'dist/dts'] }),
  ],
}

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
    externals({
      exclude: [
        'constants',
        /@lingui\/(core|react)/, // @lingui incorrectly exports esm, so it must be bundled in
        /\.json$/, // esm does not support JSON loading, so it must be bundled in
      ],
      deps: true,
      peerDeps: true,
    }),
    ...plugins,

    // Source code transformation
    url({ include: ASSET_EXTENSIONS.map((extname) => '**/*' + extname), limit: Infinity }), // imports assets as data URIs
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
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: false,
  },
  ...transpile,
}

const cjs = {
  output: {
    dir: 'dist/cjs',
    entryFileNames: '[name].cjs',
    chunkFileNames: '[name]-[hash].cjs',
    format: 'cjs',
    sourcemap: false,
  },
  ...transpile,
}

const esmLocales = {
  input: 'src/locales/*.js',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: false,
  },
  plugins: [
    commonjs(),
    multi(),
  ],
}

const cjsLocales = {
  input: 'src/locales/*.js',
  output: {
    dir: 'dist/cjs',
    sourcemap: false,
  },
  plugins: [
    multi(),
  ],
}

const config = [check, type, esm, esmLocales, cjs, cjsLocales]
module.exports = config

function squelchTranspilationWarnings(warning, warn) {
  if (warning.pluginCode === 'TS5055') return
  warn(warning)
}

function squelchTypeWarnings(warning, warn) {
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
  warn(warning)
}
