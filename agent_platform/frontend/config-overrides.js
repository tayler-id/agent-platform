const webpack = require('webpack');

module.exports = function override(config) {
  // Configure fallbacks for Node.js core modules
  config.resolve = {
    ...config.resolve,
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "crypto": require.resolve("crypto-browserify"),
      "util": require.resolve("util/")
    }
  };

  // Add necessary polyfills and plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ];

  // Add axios ES module support
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false // Disable strict ESM resolution
    }
  });

  return config;
}
