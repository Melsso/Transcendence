const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './scripts/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ACTIVE_HOST': JSON.stringify(process.env.ACTIVE_HOST),
    }),
  ],
};