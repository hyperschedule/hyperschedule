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
            {
                test: /\.(svg|woff2?|png|eot|ttf)$/,
                loader: 'file-loader',
            },
        ],
    },
    resolve: {
        modules: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'node_modules'),
        ],
        extensions: ['.js', '.jsx'],
    },
};
