/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { DefinePlugin } = require('webpack')

// Renders the cosmos fixtures in isolation, instead of using public/index.html.
module.exports = (webpackConfig) => {
  return {
    ...webpackConfig,
    module: {
      rules: [
        {
          test: /locales\/.*\.js$/i,
          type: 'javascript/auto',
        },
        {
          test: /\.json$/i,
          type: 'javascript/auto',
          use: ['json-loader'],
        },
        {
          test: /\.(js|ts)x?$/i,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.png$/i,
          type: 'asset/inline',
        },
        {
          test: /\.scss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]s$/,
          type: 'asset/inline'
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx$/,
          use: ['@svgr/webpack'],
        },
      ]
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new DefinePlugin({
        'process.env.REACT_APP_INFURA_KEY': '"4bf032f2d38a4ed6bb975b80d6340847"',
      }),
      new HtmlWebpackPlugin(),
    ],
    stats: { children: true, errorDetails: true },
  }
}
