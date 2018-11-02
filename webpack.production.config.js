const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const definePlugin = new webpack.DefinePlugin({
  '__DEV__': JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
  'WEBGL_RENDERER': JSON.stringify(true),
  'CANVAS_RENDERER': JSON.stringify(true)
});

module.exports = {
  entry: {
    app: [
      path.resolve(__dirname, 'src/main.js')
    ]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: './',
    filename: 'js/bundle.js'
  },
  plugins: [
    definePlugin,
    new CleanWebpackPlugin(['build']),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['vendor', 'app'],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyAttributes: true
      },
      hash: true
    }),    
    new CopyWebpackPlugin([
      { from: 'assets', to: 'assets' }
    ])
  ],
  module: {
    rules: [
      { test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src') },
      { test: [/\.vert$/, /\.frag$/], use: 'raw-loader' }
    ]
  },
  optimization: {
    minimize: true
  }
};