const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'MockRequests',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|typings)/,
                include: path.resolve(__dirname, 'src'),
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'typings/MockRequests.d.ts',
                to: 'index.d.[ext]'
            },
            {
                from: 'bin',
                to: 'bin'
            },
            {
                from: 'ReadMe.md',
                to: '[name].[ext]'
            },
            {
                from: 'package.json',
                to: '[name].[ext]'
            },
            {
                from: 'LICENSE.md',
                to: '[name].[ext]'
            }
        ])
    ],
    devServer: {
        port: 3000,
        open: true
    }
};
