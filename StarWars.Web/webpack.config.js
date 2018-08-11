const path = require('path');

module.exports = {
  devtool: 'eval-source-map',
  entry: {
	index: './wwwroot/js/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'wwwroot/dist')
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  resolve: {
	alias: {
      'modules': path.resolve(__dirname, 'wwwroot/js/modules'),
	  'prototypes': path.resolve(__dirname, 'wwwroot/js/prototypes'),
	}
  }
};