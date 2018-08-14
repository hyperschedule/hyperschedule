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
        include: [
          path.join(__dirname, 'src'),
        ],
        loader: 'babel-loader',
        options: {
          retainLines: true,
          presets: [
            'env',
            'react',
          ],
          plugins: [
            'transform-class-properties',
            'transform-object-rest-spread',
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
    ],
  },
  node: {
    fs: 'empty',
    dns: 'mock',
    net: 'mock',
  },
  resolve: {
    modules: [
      path.join(__dirname, 'node_modules'),
    ],
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
};
