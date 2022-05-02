/* eslint-disable @typescript-eslint/no-var-requires */
const EventEmitter = require('events')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')
const rollup = require('rollup')

const [, , esm, locales] = require('./rollup.config.cjs')

class RollupWatchPlugin extends EventEmitter {
  constructor(transpile, locales) {
    super()
    this.locales = rollup.rollup(locales).then((build) => build.write(locales.output))
    rollup.watch(transpile).on('event', this.onRollupEvent.bind(this))
    this.transpile = new Promise((resolve) => this.once('end', resolve))
  }

  async onRollupEvent(e) {
    if (e.code === 'END') this.emit('end')
  }

  async apply(compiler) {
    compiler.hooks.watchRun.tapPromise('rollup-watch', () => Promise.all([this.transpile, this.locales]))
    this.on('end', () => compiler.watching.invalidate())
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
      new RollupWatchPlugin(esm, locales),
      new DefinePlugin({
        'process.env.REACT_APP_INFURA_KEY': '"4bf032f2d38a4ed6bb975b80d6340847"',
      }),
      new HtmlWebpackPlugin(),
    ],
    watchOptions: {
      ignored: /dist/,
    }
  }
}
