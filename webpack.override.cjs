/* eslint-disable @typescript-eslint/no-var-requires */
const { DefinePlugin } = require('webpack')
const EventEmitter = require('events')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const rollup = require('rollup')

const { config: rollupConfig, assets: assetConfigs } = require('./rollup.config.cjs')
const path = require('path')

class RollupPlugin extends EventEmitter {
  static PLUGIN_NAME = 'rollup-watch'

  constructor({ config, assetConfigs, watch }) {
    super()

    if (watch) {
      this.watch(config)
    } else {
      this.rollup(config).then(() => this.emit('END'))
    }

    this.initialized = Promise.all([
      ...assetConfigs.map(this.rollup),
      new Promise((resolve) => this.once('END', resolve)),
    ])
  }

  async rollup(config) {
    const build = await rollup.rollup(config)
    return await build.write(config.output)
  }

  watch(config) {
    return rollup.watch(config).on('event', (e) => {
      this.emit(e.code, e)
      if (e.result) {
        e.result.close()
      }
    })
  }

  async apply(compiler) {
    // Waits for rollup to generate assets before compiling.
    compiler.hooks.beforeCompile.tapPromise(RollupPlugin.PLUGIN_NAME, () => this.initialized)

    this.on('BUNDLE_END', ({ input, duration }) => console.log(`rollup built ${input} in ${duration}ms`))
    await this.initialized
    this.on('START', () => console.log('rollup build invalidated by unknown file'))

    // Invalidates the build when rollup generates a new asset.
    this.on('END', () => compiler.watching.invalidate())
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
      new DefinePlugin({
        'process.env.INFURA_KEY': JSON.stringify(process.env.INFURA_KEY || '4bf032f2d38a4ed6bb975b80d6340847'),
      }),
      new HtmlWebpackPlugin(),
    ],
    stats: 'errors-warnings',
    watchOptions: {
      ignored: /dist/,
    },
  }
}
