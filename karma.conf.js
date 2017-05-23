const path   = require('path')
const config = require('./config')

const testFiles = path.join(config.srcDir, '**', '*.test.js')

module.exports = (config) => {
  config.set({
    basePath: '',
    browsers: ['PhantomJS'],
    colors: true,
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      testFiles],
    frameworks: ['mocha', 'chai'],
    reporters: ['mocha'],
    autoWatch: true,
    singleRun: false,
    preprocessors: {
      [testFiles]: ['webpack']
    },
    webpack: require('./webpack.config'),
    webpackMiddleware: {
      noInfo: true
    }
  })
}
