const path = require('path');

module.exports = {
  mode: 'development',
  entry: ['babel-polyfill', './src'],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public', 'static'),
    publicPath: 'static',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            'env',
            'react',
          ],
          plugins: [
            'babel-plugin-transform-class-properties',
          ],
        },
      },
      {
        test: /\.css?$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.(svg|woff2?|png|eot|ttf)$/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, 'src'),
    ],
    extensions: ['.js', '.jsx'],
  },
};
