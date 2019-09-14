const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = '';

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
    PUBLIC_URL: process.env.PUBLIC_URL
};

const jsRegex = /\.jsx?$/;
const cssRegex = /\.css$/;
const sassRegex = /\.scss$/;
const assetRegex = /\.(png|gif|jpe?g|svg|ico|pdf|tex)$/;

var srcDir = path.resolve(__dirname, 'src');
var entryFiles = [ '@babel/polyfill', srcDir + '/index.js' ];
var includeDir = srcDir;

if (process.env.MOCK === 'true') {
    console.log('Turning on network mocks\n');
    var mockDir = path.resolve(__dirname, 'mocks');
    var mockEntryFiles = mockDir + '/MockConfig.js';
    // Update entry field and babel-loader's include field
    entryFiles = [ mockEntryFiles, ...entryFiles ];
    includeDir = [ mockDir, includeDir ];
}

module.exports = {
    module: {
        rules: [
            {
                test: jsRegex,
                exclude: /node_modules/,
                include: includeDir,
                loader: 'babel-loader'
            },
            {
                test: sassRegex,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development',
                        }
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => require('postcss-preset-env')
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: cssRegex,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development',
                        }
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => require('postcss-preset-env')
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
                            name: `static/assets/[name]-[hash:8].[ext]`
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
        client: entryFiles,
        vendor: ['react', 'react-dom', 'prop-types']
    },
    output: {
        path: path.resolve(__dirname, outputPath),
        filename: `static/js/[name].[hash:8].bundle.js`,
        chunkFilename: `static/js/[name].[hash:8].chunk.js`
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
        new CopyWebpackPlugin([
            {
                from: 'src/assets/favicon.ico',
                to: 'static/assets/[name].[ext]'
            }
        ])
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
                }
            },
            maxSize: 240000,
            minSize: 100000,
            chunks: 'all'
        }
    },
    performance: {
        hints: false
    }
};
