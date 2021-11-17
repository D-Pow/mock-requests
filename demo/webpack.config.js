const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MockRequestsWebpackPlugin = require('mock-requests/bin/MockRequestsWebpackPlugin');

const outputPaths = {
    dev: '',
    prod: '../docs/demo'
};

const outputPath = process.env.NODE_ENV === 'production' ? outputPaths.prod : outputPaths.dev;

const env = dotenv.config({
    path: './.env'
}).parsed;

process.env = {
    ...process.env,
    ...env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PUBLIC_URL: outputPath
};

const publicEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NODE_PATH: process.env.NODE_PATH,
    PUBLIC_URL: process.env.PUBLIC_URL,
    MOCK: process.env.MOCK
};

const jsRegex = /\.jsx?$/;
const cssRegex = /\.css$/;
const sassRegex = /\.scss$/;
const assetRegex = /\.(png|gif|jpe?g|svg|ico|pdf|tex|eot)$/;

module.exports = {
    module: {
        rules: [
            {
                test: jsRegex,
                exclude: /node_modules/,
                include: /src/,
                loader: 'babel-loader'
            },
            {
                test: sassRegex,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'postcss-preset-env'
                                ]
                            }
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: cssRegex,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'postcss-preset-env'
                                ]
                            }
                        }
                    }
                ]
            },
            {
                test: assetRegex,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: `static/assets/[name]-[contenthash:8].[ext]`
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx'],
        modules: [
            path.resolve(__dirname, process.env.NODE_PATH),
            'node_modules'
        ]
    },
    entry: {
        client: {
            import: './src/index.js' ,
            dependOn: 'polyfills',
        },
        polyfills: [ 'core-js', 'isomorphic-fetch' ],
    },
    output: {
        path: path.resolve(__dirname, outputPath),
        filename: `static/js/[name].[contenthash:8].bundle.js`,
        chunkFilename: `static/js/[name].[contenthash:8].chunk.js`,
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
    devServer: {
        port: 3000,
        stats: 'minimal',
        hot: true,
        open: true
    },
    stats: {
        modules: false,
        children: false
    },
    plugins: [
        new webpack.DefinePlugin({ 'process.env': JSON.stringify(publicEnv) }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: './index.html'
        }),
        new MiniCssExtractPlugin({
            filename: `static/css/[name].[contenthash:8].css`,
            chunkFilename: `static/css/[name].[contenthash:8].chunk.css`
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/assets/',
                    to: 'static/assets/'
                }
            ]
        }),
        new MockRequestsWebpackPlugin(
            'mocks',
            'MockConfig.js',
            process.env.MOCK === 'true'
        )
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: { // split node_modules (as vendor) from src (as client)
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                },
            },
        },
        runtimeChunk: {
            name: 'runtime',
        },
    },
    performance: {
        hints: false
    }
};
