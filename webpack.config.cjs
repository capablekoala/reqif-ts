const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  target: 'web',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.esm.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      // Polyfills for Node.js core modules
      "fs": false,
      "path": require.resolve("path-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      "zlib": require.resolve("browserify-zlib"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "net": false,
      "tls": false,
      "child_process": false,
      "os": require.resolve("os-browserify/browser"),
      "process": require.resolve("process/browser"),
      "assert": require.resolve("assert/"),
      "vm": require.resolve("vm-browserify"),
      "canvas": false,
    }
  },
  plugins: [
    // Polyfill Node.js globals
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Ignore fs module in browser builds
    new webpack.IgnorePlugin({
      resourceRegExp: /^fs$/,
    }),
    // Ignore canvas module (optional dependency for jsdom)
    new webpack.IgnorePlugin({
      resourceRegExp: /^canvas$/,
      contextRegExp: /jsdom/,
    }),
  ],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: 'ReqIF',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
};