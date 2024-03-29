const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const babelConfig = require('./babel.config');

/** @type {import('webpack/types').WebpackOptionsNormalized} */
module.exports = {
    entry: {
        index: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            name: 'MockRequests',
            type: 'umd'
        },
        globalObject: 'this',
        environment: {
            arrowFunction: false,
            bigIntLiteral: false,
            const: false,
            destructuring: false,
            dynamicImport: false,
            forOf: false,
            module: false,
            optionalChaining: false,
            templateLiteral: false,
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: /src/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: babelConfig,
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'bin',
                    to: 'bin'
                },
                'ReadMe.md',
                'package.json',
                'LICENSE.md'
            ]
        })
    ],
    devServer: {
        port: 3000,
        open: true
    }
};
