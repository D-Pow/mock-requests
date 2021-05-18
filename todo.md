* Make MockRequests.d.ts use `[url: string]` for objects instead of `[p: string]`
* Move docs to gh-pages so they don't pollute app dir


* All babel plugins other than `@babel/plugin-transform-runtime` are now included in `@babel/preset-env` so uninstall the others
    - Test on IE first
* Add support for using `fetch("/rest/user/:userId")`
* Add a new npm CLI config so if third arg (`activateMocks`) is null, then it reads from e.g. `npm start --mock`
    - Some helpful starting places:
    - [package.json 'publishConfig' field](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig)
        + [Related 'config' entry](https://docs.npmjs.com/cli/v7/using-npm/config)
