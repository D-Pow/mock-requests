* Add to ReadMe:
    - Fixed links b/c custom ones don't work in npmjs.org
    - Just put the '<rootDir>/path/to/MockConfig.js' in jest config's `setupFiles` or `setupFilesAfterEnv` array. It might work in setupFiles as well, need to test it
    - IMPORTANT: Say **You don't have to read pages and pages of confusing ass garbage documentation just to get a simple task done that should be obvious** (god fucking damn, I hate fucking webpack, wtf it's such fucking garbage, wtffffdffffffffffucking hell is passed to module.rules[i].generator ?????)
* Ensure that `fetch('/some/api')` works
    - Just update `isMocked` to check with `window.location` as well as plain URL.
    - Starter test for mocking the `window.location` object:
        ```javascript
        it('should work', async () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                writable: true,
                value: {
                    origin: 'https://developer.mozilla.org'
                }
            });
            MockRequests.testInBrowser();
        });
        ```
* src --> `overwriteXHR()` --> `XHR = function()` --> use `globalScope.XHR = function()` b/c it's undefined in jest
    - That's good at the beginning, but it fails in jest.setup.js
* Change `usePathnameForAllQueries` default value from `false` to `true`.
* Make MockRequests.d.ts use `[url: string]` for objects instead of `[p: string]`
* Add support for using `fetch("/rest/user/:userId")`
* Add a new npm CLI config so if third arg (`activateMocks`) is null, then it reads from e.g. `npm start --mock`
    - Some helpful starting places:
    - [package.json 'publishConfig' field](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig)
        + [Related 'config' entry](https://docs.npmjs.com/cli/v7/using-npm/config)
