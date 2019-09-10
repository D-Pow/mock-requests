const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        MockRequests: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|MockRequests.d.ts)/,
                include: path.resolve(__dirname, 'src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: true
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'MockRequests.d.ts',
                to: '[name].[ext]'
            }
        ])
    ],
    devServer: {
        port: 3000,
        open: true
    }
};
