* Ensure resulting `docs/` dir is correctly generated.
    - May require removing or updating JSDoc tags' `@module` usage (uncertain if it's needed or not).
    - Might want to use generated .d.ts files?
        + Maybe helpful: JSDoc plugin [@babel/preset-typescript](https://babel.dev/docs/en/babel-preset-typescript) (see [github issue](https://github.com/jsdoc/jsdoc/issues/272))
* Fix the src's index.js default export as it seems to not preserve documentation when using the default export. Some ideas:
    - Don't use named exports (requires checking if the functions can be spread in users' repos).
    - Try inlining the index.js/MockRequests.js into one types.ts output file.
    - Find a way to add `export as namespace "mock-requests";` to .d.ts output
* Make MockRequests.d.ts use `[url: string]` for objects instead of `[p: string]`
* MockRequestsWebpackPlugin:
    - Add refs to imported webpack types.
    - Make the constructor JSDoc appear when calling `new MockRequestsWebpackPlugin()`.
    - Mark methods/fields as `@private`.
* Make d-pow.github.io service worker not cache MockRequests or other subfolders. Either:
    - Find a way to not cache subfolders
    - Or, just don't cache anything other than the populated URLs
* Move docs to gh-pages so they don't pollute app dir


* All babel plugins other than `@babel/plugin-transform-runtime` are now included in `@babel/preset-env` so uninstall the others
    - Test on IE first
* Add support for `fetch("/path/without/domain")`
* Add a new npm CLI config so if third arg (`activateMocks`) is null, then it reads from e.g. `npm start --mock`
    - Some helpful starting places:
    - [package.json 'publishConfig' field](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig)
        + [Related 'config' entry](https://docs.npmjs.com/cli/v7/using-npm/config)
