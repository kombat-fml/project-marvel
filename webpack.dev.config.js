const path = require('path');
module.exports = {
  entry: './app/js/main.js',
  output: {
    filename: 'scripts.js',
    path: path.resolve(__dirname, './app')
  },
  mode: 'development',
  devServer: {
    open: true,
    port: 8080,
    liveReload: true,
    writeToDisk: true,
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env']
        }
      },
      exclude: /node_modules/,
    }]
  }
}