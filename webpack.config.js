const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJs = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const pJson = require('./package.json');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
const isTest = ENV === 'test' || ENV === 'test-watch';
const isProd = ENV === 'build';
const webpack = require('webpack');

module.exports = {
  entry: isTest ? null : {
    app: './src/scripts/app.js'
  },

  output: isTest ? {} : {
    // Absolute output directory
    path: __dirname + '/dist',

    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: isProd ? '/' : 'http://localhost:8080/',

    // Filename for entry points
    // Only adds hash in build mode
    filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js'
  },

  module: {
    // configuration regarding modules

    rules: [
      // rules for modules (configure loaders, parser options, etc.)
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,

        use: [
          {
            loader: 'html-loader',
            options: {}
          }
        ]
      },
      {
        // Capture eot, ttf, woff, and woff2
        test: /\.(eot|ttf|woff|woff2|svg|otf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      {
        test: /\.css$/,
        use: isTest ? 'null-loader' : [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: isTest ? 'null-loader' : ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader' // translates CSS into CommonJS
          }, {
            loader: 'postcss-loader'
          }, {
            loader: 'sass-loader' // compiles Sass to CSS
          }]
        })
      }
    ]
  },

  resolve: {
    modules: [
      'node_modules'
    ],
    // directories where to look for modules

    extensions: ['.webpack.js', '.web.js', '.js', '.html'],
    // extensions that are used
  },

  performance: {
    hints: 'warning', // enum
    maxAssetSize: 20000000, // int (in bytes),
    maxEntrypointSize: 40000000, // int (in bytes)
    assetFilter: function(assetFilename) {
      // Function predicate that provides asset filenames
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  },

  devtool: (function() {
    if (isTest) {
      return 'inline-source-map';
    }
    if (isProd) {
      return 'source-map';
    }

    return 'eval-source-map';
  }()), // enum
  // enhance debugging by adding meta info for the browser devtools
  // source-map most detailed at the expense of build speed.

  context: __dirname, // string (absolute path!)
  // the home directory for webpack
  // the entry and module.rules.loader option
  //   is resolved relative to this directory

  target: 'web', // enum
  // the environment in which the bundle should run
  // changes chunk loading behavior and available modules

  externals: [],
  // Don't follow/bundle these modules, but request them at runtime from the environment

  stats: 'errors-only',
  // lets you precisely control what bundle information gets displayed

  devServer: {
    contentBase: path.join(__dirname, 'src', 'public'), // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    noInfo: true, // only errors & warns on hot reload
  },

  plugins: (function () {
    let plugins = [
      new webpack.DefinePlugin({
          'process.env': {
              'NODE_ENV': (isProd && !isTest) ? '"production"' : '""'
          }
      }),
      new webpack.DefinePlugin({
        VERSION: {
          number: `"${pJson.version}"`,
          date: `"${pJson.releaseDate}"`
        }
      })
    ];

    if (!isTest) {
      plugins = plugins.concat([
        new HtmlWebpackPlugin({
          template: './src/public/index.html',
          inject: 'body'
        }),

        new ExtractTextPlugin('[name].[hash].css', { disable: !isProd })
      ]);
    }

    if (isProd && !isTest) {
      plugins = plugins.concat([
        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: { discardComments: { removeAll: true } },
          canPrint: true
        }),

        // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
        // Only emit files when there are no errors
        new webpack.NoErrorsPlugin(),

        // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
        // Minify all javascript, switch loaders to minimizing mode
        new UglifyJs(),

        // Copy assets from the public folder
        // Reference: https://github.com/kevlened/copy-webpack-plugin
        new CopyWebpackPlugin([{
          from: __dirname + '/src/public'
        }]),

        new OfflinePlugin({
          ServiceWorker: {
            navigateFallbackURL: '/',
            events: true
          },
          AppCache: false
        })
      ]);
    }

    return plugins;
  }())
}
