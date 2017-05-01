const webpack    = require('webpack')
const path       = require('path')
const HtmlPlugin = require('html-webpack-plugin')

const srcDir   = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'dist')

module.exports = {
  entry: ['babel-polyfill', path.join(srcDir, 'index.jsx')],
  output: {
    path:     buildDir,
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test:    /\.jsx?$/,
      exclude: /node_modules/,
      use:     [{ loader: 'babel-loader' }]
    }, {
      test: /\.css$/,
      use:  ['style-loader', 'css-loader']
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: { picker: 'pickadate/lib/picker' }
  },
  plugins: [
    new HtmlPlugin({ template: 'index.html' })
  ]
}
