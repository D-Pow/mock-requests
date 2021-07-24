* Make MockRequests.d.ts use `[url: string]` for objects instead of `[p: string]`
* Add support for using `fetch("/rest/user/:userId")`
* Support .mjs/ESM node (`import`) as well as .cjs (`require`) in node.
* Add a new npm CLI config so if third arg (`activateMocks`) is null, then it reads from e.g. `npm start --mock`
    - Some helpful starting places:
    - [package.json 'publishConfig' field](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig)
        + [Related 'config' entry](https://docs.npmjs.com/cli/v7/using-npm/config)
