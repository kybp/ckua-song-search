module.exports = (config) => {
  config.set({
    basePath: '',
    browsers: ['PhantomJS'],
    colors: true,
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/**/*.test.js'],
    frameworks: ['mocha', 'chai'],
    reporters: ['mocha'],
    autoWatch: true,
    singleRun: false,
    preprocessors: {
      'src/**/*.test.js': ['webpack']
    },
    webpack: require('./webpack.config'),
    webpackMiddleware: {
      noInfo: true
    }
  })
}
