/* eslint-disable @typescript-eslint/no-var-requires */
const EventEmitter = require('events')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const rollup = require('rollup')

const { config: rollupConfig, assets: assetConfigs } = require('./rollup.config.js')
const path = require('path')

process.env.NODE_ENV = 'cosmos'
require('dotenv').config()

class RollupPlugin extends EventEmitter {
  static PLUGIN_NAME = 'rollup-watch'

  constructor({ config, assetConfigs, watch }) {
    super()

    this.initialized = Promise.all([
      ...assetConfigs.map(this.rollup),
      new Promise((resolve) => {
        if (watch) {
          this.watch(config)
          this.on('START', () => console.log('rollup building...'))
            .on('BUNDLE_END', ({ input, duration }) => console.log(`rollup built ${input} in ${duration}ms`))
            .once('END', resolve)
        } else {
          this.rollup(config).then(resolve)
        }
      }),
    ])
  }

  async rollup(config) {
    const build = await rollup.rollup(config)
    await build.write(config.output)
  }

  watch(config) {
    rollup.watch(config).on('event', (e) => {
      this.emit(e.code, e)
      if (e.result) {
        e.result.close()
      }
    })
  }

  apply(compiler) {
    // Wait for rollup to generate initial assets before compilation.
    compiler.hooks.beforeCompile.tapPromise(RollupPlugin.PLUGIN_NAME, () => this.initialized)

    // It's possible to invalidate the watcher on BUILD_END, but that will duplicate builds due to webpack's watcher.
    // It's also possible to ignore dist/ in webpack's watcher, and explicitly update the files in webpack, but it would
    // be prohibitively complex. Instead, webpack just watches rollup's output.
  }
}

module.exports = (webpackConfig) => {
  const { mode, module, resolve } = webpackConfig
  const { rules } = module
  return {
    ...webpackConfig,
    resolve: {
      ...resolve,
      alias: {
        '@uniswap/widgets': path.resolve(__dirname, 'dist/'),
      },
    },
    module: {
      rules: [
        ...rules,
        {
          test: /\.json$/i,
          type: 'javascript/auto',
          use: ['json-loader'],
        },
      ],
    },
    plugins: [
      new RollupPlugin({ config: rollupConfig, assetConfigs, watch: mode !== 'production' }),
      new HtmlWebpackPlugin(),
    ],
    stats: 'errors-warnings',
  }
}
