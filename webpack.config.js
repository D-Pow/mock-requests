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
        libraryTarget: 'umd',
        globalObject: 'this',
        environment: {
            arrowFunction: false,
            bigIntLiteral: false,
            const: false,
            destructuring: false,
            dynamicImport: false,
            forOf: false,
            module: false
        }
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
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'typings/MockRequests.d.ts',
                    to: 'index.d.[ext]'
                },
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
