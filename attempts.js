/*
 * Some useful resources:
 * https://stackoverflow.com/questions/3171454/best-way-to-document-anonymous-objects-and-functions-with-jsdoc
 * https://webpack.js.org/api/compiler-hooks/#compilation
 * https://webpack.js.org/api/compilation-hooks/#additionalassets
 * https://webpack.js.org/api/compilation-object/#emitasset
 * https://webpack.js.org/api/normalmodulefactory-hooks/#resolve
 * https://stackoverflow.com/questions/65515354/can-i-use-a-webpack-hook-to-modify-file-output-just-before-it-gets-saved
 * https://webpack.js.org/contribute/writing-a-plugin/
 * https://webpack.js.org/contribute/writing-a-plugin/
 * https://www.google.com/search?q=webpack+additionalAssets+example&oq=webpack+additionalAssets+example&aqs=chrome..69i57j33i10i160j33i299.3937j1j1&sourceid=chrome&ie=UTF-8
 * https://github.com/jantimon/extra-entry-webpack-plugin/blob/master/index.js
 * https://www.google.com/search?q=webpack+plugin+add+extra+module+to+resolve&oq=webpack+plugin+add+extra+module+to+resolve&aqs=chrome..69i57j33i160.37103j1j1&sourceid=chrome&ie=UTF-8
 * https://www.google.com/search?q=webpack+compiler+thiscompilation+vs+compilation&oq=webpack+compiler+thiscompilation+vs+compilation&aqs=chrome..69i57j33i299l3.6930j1j1&sourceid=chrome&ie=UTF-8
 * https://github.com/ppiyush13/dynamic-entry-webpack-plugin/blob/master/src/index.js
 */


// Maybe want `interceptors`
// console.log('compilation')
// compiler.hooks.initialize.tap(this.constructor.name, compilation => {
//     console.log(util.inspect(compilation, { depth: null }))
// });
// console.log('others')
// Object.entries(compiler.hooks.thisCompilation).forEach((key, val) => {
//     console.log('blah', key)
//     console.log('blah', util.inspect({key: val}, { depth: null }))
// });
// Object.keys(compiler.hooks).forEach(key => {
//     util.inspect(compiler.hooks[key], { depth: null })
// });
// compiler.hooks.beforeCompile.tap(this.constructor.name, compilation => {
//     console.log('Plugin yo', util.inspect(compilation, { depth: null}))
// });


        compiler.hooks.beforeCompile.tap(this.constructor.name, (params, callback) => {
            console.log('beforeCompile');
            // console.log('params', params);
            const { /** @type NormalModuleFactory */ normalModuleFactory, contextModuleFactory } = params;

            // log('normalModuleFactory:', normalModuleFactory.ruleSet.references)
        });

        // log('target:', compiler.webpack.config.getNormalizedWebpackOptions())

        compiler.hooks.thisCompilation.tap({
            name: this.constructor.name,
            // stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
        }, (comp, configs) => {
            console.log('thisCompilation')
            // console.log(util.inspect(compilation.getStats().options, { depth: null }))
            // console.log(util.inspect(compilation.options, { depth: null}))

            // console.log(util.inspect(configs, { depth: null }))

            /** @type {Compilation} */
            const compilation = comp;
            const { context } = compilation.options;


            console.log('assets:', compilation.getAssets())

            console.log('output:', compilation.outputOptions.filename)

            log('thisCompilation > modules:', [...compilation.modules.keys()])

            // compilation.getModule()

            // console.log('modules:', util.inspect([...compilation.modules.keys()], { depth: null }))

            // compilation.addInclude()
            // compilation.emitAsset(this.mockEntryFile, entryAbsPath);

            // compilation.hooks.processAssets.tap({
            //     name: this.constructor.name,
            //     stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
            // }, (...args) => {
            //     console.log('additionalAssets')
            //     console.log(args)
            // });


            // console.log('context:', context, 'path:', compilation.getPath(this.mockEntryFile))

            // compilation.addEntry(context, this.mockEntryFile, this.mockEntryFile, (err, module) => {
            //     if (err) {
            //         console.error('Could not add', this.mockEntryFile, 'to output. Error:', err);
            //     } else {
            //         console.log(module)
            //     }
            // });



            // Option to change module loaders itself (i.e. `loader` used in `rules` but that's more complex than necessary)
            // compilation.hooks.normalModuleLoader.tap(this.constructor.name, (loaderContext, module) => {
            //     console.log('modules.loaders:', util.inspect(module.loaders, { depth: null }))
            // });
        });