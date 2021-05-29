* src --> `overwriteXHR()` --> `XHR = function()` --> use `globalScope.XHR = function()` b/c it's undefined in jest
    - That's good at the beginning, but it fails in jest.setup.js
* Make MockRequests.d.ts use `[url: string]` for objects instead of `[p: string]`
* Ensure that `fetch('/some/api')` works
    - Just update `isMocked` to check with `window.location` as well as plain URL.
* Add support for using `fetch("/rest/user/:userId")`
* Add a new npm CLI config so if third arg (`activateMocks`) is null, then it reads from e.g. `npm start --mock`
    - Some helpful starting places:
    - [package.json 'publishConfig' field](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig)
        + [Related 'config' entry](https://docs.npmjs.com/cli/v7/using-npm/config)
