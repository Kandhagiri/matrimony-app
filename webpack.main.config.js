const path = require('path');

module.exports = (env, argv) => {
  return {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main.js',
    externals: {
      fs: 'commonjs fs',
      path: 'commonjs path',

    },
    // Put your normal webpack config below here
    module: {
      rules: require('./webpack.rules'),
    },
    target: 'electron-main',
    node: {
      __dirname: false,
      __filename: false,
    },
    output: {
      path: path.resolve(__dirname, '.webpack/main'),
      filename: 'index.js',
    },
  };
};
