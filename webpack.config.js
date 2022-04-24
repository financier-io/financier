const HtmlWebpackPlugin = require("html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const pJson = require("./package.json");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
const isProd = ENV === "build";
const webpack = require("webpack");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: isProd ? "production" : "development",
  entry: {
    app: "./src/scripts/app.js",
  },

  output: {
    // Absolute output directory
    path: __dirname + "/dist",

    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: isProd ? "/" : "http://localhost:8080/",

    // Filename for entry points
    // Only adds hash in build mode
    filename: isProd ? "[name].[contenthash].js" : "[name].bundle.js",

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: isProd ? "[name].[contenthash].js" : "[name].bundle.js",
  },

  module: {
    // configuration regarding modules

    rules: [
      // rules for modules (configure loaders, parser options, etc.)
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\/public\/icons\/.*$/,
        type: "asset/resource",
        generator: {
          filename: "icons/[name][ext]",
        },
      },
      {
        // Capture eot, ttf, woff, and woff2
        test: /\.(eot|ttf|woff|woff2|svg|otf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        type: "asset/resource",
      },
      {
        test: /\.css$/i,
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "postcss-loader",
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },

  resolve: {
    modules: ["node_modules"],
    // directories where to look for modules

    extensions: [".webpack.js", ".web.js", ".js", ".html"],
    // extensions that are used
  },

  performance: {
    hints: "warning", // enum
    maxAssetSize: 20000000, // int (in bytes),
    maxEntrypointSize: 40000000, // int (in bytes)
    assetFilter: (assetFilename) => {
      // Function predicate that provides asset filenames
      return assetFilename.endsWith(".css") || assetFilename.endsWith(".js");
    },
  },

  devtool: (function () {
    if (isProd) {
      return "source-map";
    }

    return "eval-source-map";
  })(), // enum
  // enhance debugging by adding meta info for the browser devtools
  // source-map most detailed at the expense of build speed.

  context: __dirname, // string (absolute path!)
  // the home directory for webpack
  // the entry and module.rules.loader option
  //   is resolved relative to this directory

  target: "web", // enum
  // the environment in which the bundle should run
  // changes chunk loading behavior and available modules

  externals: [],
  // Don't follow/bundle these modules, but request them at runtime from the environment

  stats: "errors-only",
  // lets you precisely control what bundle information gets displayed

  devServer: {
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
  },

  plugins: (function () {
    let plugins = [
      new webpack.DefinePlugin({
        VERSION: {
          number: `"${pJson.version}"`,
          date: `"${pJson.releaseDate}"`,
        },
      }),

      new CopyPlugin({
        patterns: [{ from: "src/public", to: "" }],
      }),

      new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject: "body",
      }),
    ];

    if (isProd) {
      plugins = plugins.concat([
        new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),

        new CssMinimizerPlugin(),

        new InjectManifest({ swSrc: "./src/sw.js" }),
      ]);
    }

    return plugins;
  })(),
};
