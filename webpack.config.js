const webpack = require( 'webpack' );
const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );

const definePlugin = new webpack.DefinePlugin( {
  '__DEV__': JSON.stringify( JSON.parse( process.env.BUILD_DEV || 'true' ) ),
  'WEBGL_RENDERER': JSON.stringify( true ),
  'CANVAS_RENDERER': JSON.stringify( true )
} );

module.exports = {
  entry: {
    app: [
      path.resolve( __dirname, 'src/main.js' )
    ],
    vendor: [ 'phaser' ]
  },
  output: {
    pathinfo: true,
    path: path.resolve( __dirname, 'build', 'dev' ),
    publicPath: './dev/',
    library: '[name]',
    libraryTarget: 'umd',
    filename: '[name].js'
  },
  watch: true,
  plugins: [
    definePlugin,
    new HtmlWebpackPlugin( {
      filename: '../index.html',
      template: './src/index.html',
      chunks: [ 'vendor', 'app' ],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: false,
        collapseWhitespace: false,
        html5: false,
        minifyCSS: false,
        minifyJS: false,
        minifyURLs: false,
        removeComments: false,
        removeEmptyAttributes: false
      },
      hash: false
    } ),
    new BrowserSyncPlugin( {
      host: process.env.IP || 'localhost',
      port: process.env.PORT || 3000,
      server: {
        baseDir: [ './', './build' ]
      }
    } )
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [ 'babel-loader' ],
        include: path.join( __dirname, 'src' )
      },
      {
        test: [ /\.vert$/, /\.frag$/ ],
        use: 'raw-loader'
      }
    ]
  }
};