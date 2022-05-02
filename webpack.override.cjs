/* eslint-disable @typescript-eslint/no-var-requires */
const { DefinePlugin } = require('webpack')
const EventEmitter = require('events')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const rollup = require('rollup')

const rollupConfig = require('./rollup.config.cjs')
const { assets: assetConfigs } = rollupConfig

class RollupWatchPlugin extends EventEmitter {
  static PLUGIN_NAME = 'rollup-watch'

  constructor({ watchConfig, assetConfigs }) {
    super()

    rollup.watch(watchConfig).on('event', (e) => {
      this.emit(e.code, e)
      if (e.result) {
        e.result.close()
      }
    })

    this.initialized = Promise.all([
      ...assetConfigs.map((config) => rollup.rollup(config).then((build) => build.write(config.output))),
      new Promise((resolve) => this.once('END', resolve)),
    ])
  }

  apply(compiler) {
    // Waits for rollup to generate assets for the initial compilation.
    compiler.hooks.watchRun.tapPromise(RollupWatchPlugin.PLUGIN_NAME, () => this.initialized)

    this.on('BUNDLE_END', (({ input, duration }) => console.log(`rollup built ${input} in ${duration}ms`)))
    this.initialized.then(() => {
      this.on('START', () => console.log('rollup build invalidated by unknown file'))

      // Invalidates the build when rollup generates a new asset.
      this.on('END', () => compiler.watching.invalidate())
    })
  }
} 

module.exports = (webpackConfig) => {
  const { rules } = webpackConfig.module
  return {
    ...webpackConfig,
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
      new RollupWatchPlugin({ watchConfig: rollupConfig, assetConfigs }),
      new DefinePlugin({
        'process.env.REACT_APP_INFURA_KEY': '"4bf032f2d38a4ed6bb975b80d6340847"',
      }),
      new HtmlWebpackPlugin(),
    ],
    stats: 'errors-warnings',
    watchOptions: {
      ignored: /dist/,
    },
  }
}
