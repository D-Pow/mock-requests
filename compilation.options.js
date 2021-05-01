compilation.options = {
    amd: undefined,
    bail: undefined,
    cache: {
        type: 'memory'
    },
    context: '/media/storage/Documents/Repositories/react-app-boilerplate',
    dependencies: undefined,
    devServer: {
        port: 3000,
        stats: 'minimal',
        hot: false,
        historyApiFallback: true
    },
    devtool: 'eval',
    entry: {
        main: {
            import: ['/media/storage/Documents/Repositories/react-app-boilerplate/node_modules/webpack-dev-server/client/index.js?http://localhost:3000',
           '/media/storage/Documents/Repositories/react-app-boilerplate/src/index.js']
        }
    },
    experiments: {
        topLevelAwait: false,
        syncWebAssembly: false,
        asyncWebAssembly: false,
        outputModule: false
    },
    externals: undefined,
    externalsPresets: {
        web: true,
        node: false,
        nwjs: false,
        electron: false,
        electronMain: false,
        electronPreload: false,
        electronRenderer: false
    },
    externalsType: 'var',
    ignoreWarnings: undefined,
    infrastructureLogging: {
        level: 'info',
        debug: false
    },
    loader: {
        target: 'web'
    },
    mode: 'development',
    module: {
        noParse: undefined,
        unsafeCache: [Function],
        parser: {
            javascript: {
                unknownContextRequest: '.',
                unknownContextRegExp: false,
                unknownContextRecursive: true,
                unknownContextCritical: true,
                exprContextRequest: '.',
                exprContextRegExp: false,
                exprContextRecursive: true,
                exprContextCritical: true,
                wrappedContextRegExp: /.*/,
                wrappedContextRecursive: true,
                wrappedContextCritical: false,
                strictExportPresence: false,
                strictThisContextOnImports: false
            },
            asset: {
                dataUrlCondition: {
                    maxSize: 8096
                }
            }
        },
        generator: {},
        defaultRules: [{
                type: 'javascript/auto'
            },
            {
                mimetype: 'application/node',
                type: 'javascript/auto'
            },
            {
                test: /\.json$/i,
                type: 'json'
            },
            {
                mimetype: 'application/json',
                type: 'json'
            },
            {
                test: /\.mjs$/i,
                type: 'javascript/esm',
                resolve: {
                    byDependency: {
                        esm: {
                            fullySpecified: true
                        }
                    }
                }
            },
            {
                test: /\.js$/i,
                descriptionData: {
                    type: 'module'
                },
                type: 'javascript/esm',
                resolve: {
                    byDependency: {
                        esm: {
                            fullySpecified: true
                        }
                    }
                }
            },
            {
                test: /\.cjs$/i,
                type: 'javascript/dynamic'
            },
            {
                test: /\.js$/i,
                descriptionData: {
                    type: 'commonjs'
                },
                type: 'javascript/dynamic'
            },
            {
                mimetype: {
                    or: ['text/javascript', 'application/javascript']
                },
                type: 'javascript/esm',
                resolve: {
                    byDependency: {
                        esm: {
                            fullySpecified: true
                        }
                    }
                }
            },
            {
                dependency: 'url',
                type: 'asset/resource'
            }],
        rules: [{
                test: /\.jsx?$/,
                exclude: /node_modules/,
                include: [/src/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env',
                                {
                                    useBuiltIns: 'entry',
                                    corejs: 3,
                                    targets: {
                                        node: 'current',
                                        browsers: '> 0.25%, not dead'
                                    }
                                }],
                   '@babel/preset-react',
                   '@babel/preset-typescript'],
                        plugins: ['@babel/plugin-transform-runtime',
                   '@babel/plugin-transform-regenerator',
                   '@babel/plugin-proposal-class-properties',
                   '@babel/plugin-syntax-dynamic-import']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                include: /src/,
                use: [{
                        loader: 'babel-loader',
                        options: {
                            presets: [['@babel/preset-env',
                                    {
                                        useBuiltIns: 'entry',
                                        corejs: 3,
                                        targets: {
                                            node: 'current',
                                            browsers: '> 0.25%, not dead'
                                        }
                                    }],
                     '@babel/preset-react',
                     '@babel/preset-typescript'],
                            plugins: ['@babel/plugin-transform-runtime',
                     '@babel/plugin-transform-regenerator',
                     '@babel/plugin-proposal-class-properties',
                     '@babel/plugin-syntax-dynamic-import']
                        }
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'config/tsconfig.json'
                        }
                    }]
            },
            {
                test: /\.s?css$/,
                use: ['/media/storage/Documents/Repositories/react-app-boilerplate/node_modules/mini-css-extract-plugin/dist/loader.js',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: ['postcss-preset-env']
                            }
                        }
                    },
             'sass-loader']
            },
            {
                test: [/\.(png|gif|jpe?g|svg|ico|pdf|tex)$/, /\.(ttf|woff2?|eot)$/],
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: [Function: name],
                        outputPath: [Function: outputPath]
                    }
                }]
            }]
    },
    name: undefined,
    node: {
        global: true,
        __filename: 'mock',
        __dirname: 'mock'
    },
    optimization: {
        minimizer: [TerserPlugin {
                options: {
                    test: /\.m?js(\?.*)?$/i,
                    extractComments: true,
                    sourceMap: undefined,
                    cache: true,
                    cacheKeys: [Function: cacheKeys],
                    parallel: true,
                    include: undefined,
                    exclude: undefined,
                    minify: undefined,
                    terserOptions: {}
                }
            },
        OptimizeCssAssetsWebpackPlugin {
                pluginDescriptor: {
                    name: 'OptimizeCssAssetsWebpackPlugin'
                },
                options: {
                    assetProcessors: [{
                        phase: 'compilation.optimize-chunk-assets',
                        regExp: /\.css(\?.*)?$/i,
                        processor: [Function: processor]
                    }],
                    canPrint: undefined,
                    assetNameRegExp: /\.css(\?.*)?$/i,
                    cssProcessor: {
                        [Function: creator] process: [Function]
                    },
                    cssProcessorOptions: {},
                    cssProcessorPluginOptions: {}
                },
                phaseAssetProcessors: {
                    'compilation.optimize-chunk-assets': [{
                        phase: 'compilation.optimize-chunk-assets',
                        regExp: /\.css(\?.*)?$/i,
                        processor: [Function: processor]
                    }],
                    'compilation.optimize-assets': [],
                    emit: []
                },
                deleteAssetsMap: {}
            }],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\\/]node_modules[\\\/]/,
                    name: 'vendor-chunk',
                    chunks: 'all'
                },
                styles: {
                    test: /\.s?css$/,
                    name: 'styles',
                    chunks: 'all',
                    enforce: true
                },
                default: {
                    idHint: '',
                    reuseExistingChunk: true,
                    minChunks: 2,
                    priority: -20
                },
                defaultVendors: {
                    idHint: 'vendors',
                    reuseExistingChunk: true,
                    test: /[\\\/]node_modules[\\\/]/i,
                    priority: -10
                }
            },
            defaultSizeTypes: ['javascript', 'unknown', 'css/mini-extract'],
            hidePathInfo: false,
            chunks: 'async',
            usedExports: true,
            minChunks: 1,
            minSize: 10000,
            minRemainingSize: 0,
            enforceSizeThreshold: 30000,
            maxAsyncRequests: Infinity,
            maxInitialRequests: Infinity,
            automaticNameDelimiter: '-'
        },
        runtimeChunk: false,
        emitOnErrors: true,
        removeAvailableModules: false,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
        flagIncludedChunks: false,
        moduleIds: 'named',
        chunkIds: 'named',
        sideEffects: 'flag',
        providedExports: true,
        usedExports: false,
        innerGraph: false,
        mangleExports: false,
        concatenateModules: false,
        checkWasmTypes: false,
        mangleWasmImports: false,
        portableRecords: false,
        realContentHash: false,
        minimize: false,
        nodeEnv: 'development'
    },
    output: {
        assetModuleFilename: '[hash][ext][query]',
        charset: true,
        chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
        chunkFormat: 'array-push',
        chunkLoading: 'jsonp',
        chunkLoadingGlobal: 'webpackChunkreact_app_boilerplate',
        chunkLoadTimeout: 120000,
        clean: undefined,
        compareBeforeEmit: true,
        crossOriginLoading: false,
        devtoolFallbackModuleFilenameTemplate: undefined,
        devtoolModuleFilenameTemplate: undefined,
        devtoolNamespace: 'react-app-boilerplate',
        environment: {
            arrowFunction: false,
            bigIntLiteral: false,
            const: false,
            destructuring: false,
            dynamicImport: false,
            forOf: false,
            module: false
        },
        enabledChunkLoadingTypes: ['jsonp', 'import-scripts'],
        enabledLibraryTypes: [],
        enabledWasmLoadingTypes: ['fetch'],
        filename: 'static/js/[name].[contenthash:8].bundle.js',
        globalObject: 'self',
        hashDigest: 'hex',
        hashDigestLength: 20,
        hashFunction: 'md4',
        hashSalt: undefined,
        hotUpdateChunkFilename: '[id].[fullhash].hot-update.js',
        hotUpdateGlobal: 'webpackHotUpdatereact_app_boilerplate',
        hotUpdateMainFilename: '[runtime].[fullhash].hot-update.json',
        iife: true,
        importFunctionName: 'import',
        importMetaName: 'import.meta',
        scriptType: false,
        library: undefined,
        module: false,
        path: '/media/storage/Documents/Repositories/react-app-boilerplate',
        pathinfo: true,
        publicPath: 'auto',
        sourceMapFilename: '[file].map[query]',
        sourcePrefix: undefined,
        strictModuleExceptionHandling: false,
        uniqueName: 'react-app-boilerplate',
        wasmLoading: 'fetch',
        webassemblyModuleFilename: '[hash].module.wasm',
        workerChunkLoading: 'import-scripts',
        workerWasmLoading: 'fetch'
    },
    parallelism: 100,
    performance: {
        hints: false,
        maxAssetSize: 250000,
        maxEntrypointSize: 250000
    },
    plugins: [CLIPlugin {
            options: {
                configPath: WeakMap {
                    [items unknown]
                },
                helpfulOutput: true,
                hot: undefined,
                progress: undefined,
                prefetch: undefined,
                analyze: undefined
            },
            logger: WebpackLogger {
                getChildLogger: [Function],
          [Symbol(webpack logger raw log method)]: [Function]
            }
        },
     DefinePlugin {
            definitions: {
                'process.env': '{"NODE_ENV":"development","NODE_PATH":"src/","PUBLIC_URL":"static","BROADCAST_CHANNEL":"react-app-boilerplate"}'
            }
        },
     HtmlWebpackPlugin {
            userOptions: {
                title: 'React App Boilerplate',
                template: '/media/storage/Documents/Repositories/react-app-boilerplate/src/index.html',
                meta: {
                    description: 'A simpler React boilerplate than CRA with more useful built-in features',
                    keywords: 'boilerplate, web development, create-react-app, typescript, website, webpack',
                    'theme-color': '#3800FF'
                }
            },
            version: 5,
            options: {
                template: '/media/storage/Documents/Repositories/react-app-boilerplate/src/index.html',
                templateContent: false,
                templateParameters: [Function: templateParametersGenerator],
                filename: 'index.html',
                publicPath: 'auto',
                hash: false,
                inject: 'head',
                scriptLoading: 'defer',
                compile: true,
                favicon: false,
                minify: 'auto',
                cache: true,
                showErrors: true,
                chunks: 'all',
                excludeChunks: [],
                chunksSortMode: 'auto',
                meta: {
                    description: 'A simpler React boilerplate than CRA with more useful built-in features',
                    keywords: 'boilerplate, web development, create-react-app, typescript, website, webpack',
                    'theme-color': '#3800FF'
                },
                base: false,
                title: 'React App Boilerplate',
                xhtml: false
            }
        },
     MockRequestsPlugin {
            mocksDir: 'mocks',
            mockConfigFile: 'mocks/MockConfig.js',
            activateMocks: false
        },
     MiniCssExtractPlugin {
            _sortedModulesCache: WeakMap {
                [items unknown]
            },
            options: {
                filename: 'static/css/[name].[contenthash:8].css',
                ignoreOrder: false,
                chunkFilename: 'static/css/[name].[contenthash:8].css'
            },
            runtimeOptions: {
                insert: undefined,
                linkType: 'text/css',
                attributes: undefined
            }
        },
     CopyPlugin {
            patterns: [{
                    from: 'src/manifest.json',
                    to: '[name].[ext]'
                },
                {
                    from: 'src/ServiceWorker.js',
                    to: '[name].[ext]'
                }],
            options: {}
        },
     AlterFilePostBuildPlugin {
            fileName: 'ServiceWorker.js',
            textToReplace: /urlsToCache ?= ?\[\]/g,
            replaceWith: [Function],
            run: false
        },
     AlterFilePostBuildPlugin {
            fileName: 'ServiceWorker.js',
            textToReplace: 'VERSION',
            replaceWith: '0.1.0',
            run: false
        },
     AlterFilePostBuildPlugin {
            fileName: 'ServiceWorker.js',
            textToReplace: 'BRD_CHANNEL',
            replaceWith: 'react-app-boilerplate',
            run: false
        }],
    profile: false,
    recordsInputPath: false,
    recordsOutputPath: false,
    resolve: {
        byDependency: {
            wasm: {
                conditionNames: ['import', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...']
            },
            esm: {
                conditionNames: ['import', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...']
            },
            worker: {
                conditionNames: ['import', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...'],
                preferRelative: true
            },
            commonjs: {
                conditionNames: ['require', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...']
            },
            amd: {
                conditionNames: ['require', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...']
            },
            loader: {
                conditionNames: ['require', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...']
            },
            unknown: {
                conditionNames: ['require', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...']
            },
            undefined: {
                conditionNames: ['require', 'module', '...'],
                aliasFields: ['browser'],
                mainFields: ['browser', 'module', '...']
            },
            url: {
                preferRelative: true
            }
        },
        cache: true,
        modules: ['/media/storage/Documents/Repositories/react-app-boilerplate/src',
        'node_modules'],
        conditionNames: ['webpack', 'development', 'browser'],
        mainFiles: ['index'],
        extensions: ['*', '.js', '.jsx'],
        aliasFields: [],
        exportsFields: ['exports'],
        roots: ['/media/storage/Documents/Repositories/react-app-boilerplate'],
        mainFields: ['main']
    },
    resolveLoader: {
        cache: true,
        conditionNames: ['loader', 'require', 'node'],
        exportsFields: ['exports'],
        mainFields: ['loader', 'main'],
        extensions: ['.js'],
        mainFiles: ['index']
    },
    snapshot: {
        resolveBuildDependencies: {
            timestamp: true,
            hash: true
        },
        buildDependencies: {
            timestamp: true,
            hash: true
        },
        resolve: {
            timestamp: true
        },
        module: {
            timestamp: true
        },
        immutablePaths: [],
        managedPaths: ['/media/storage/Documents/Repositories/react-app-boilerplate/node_modules']
    },
    stats: {
        modules: false,
        children: false,
        colors: true
    },
    target: 'web',
    watch: false,
    watchOptions: {}
}
