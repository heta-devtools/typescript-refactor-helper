//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack'); // ✅ Required for IgnorePlugin

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js context
  mode: 'production',
  optimization: {
    minimize: true,  // ✅ Minifies JS to reduce size
    usedExports: true // ✅ Removes unused exports (Tree Shaking)
  },

  entry: './src/extension.ts', // Main entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // Exclude VS Code API from bundling
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }]
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log" // Enables logging for debugging
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^typescript$/, // ✅ Ignores TypeScript internal resolution
      contextRegExp: /node_modules/ // ✅ Prevents Webpack from processing TypeScript internals
    })
  ]
};

module.exports = [extensionConfig];