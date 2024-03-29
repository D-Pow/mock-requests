# MockRequests

<!--
    Specify branch via: ?branch=my-branch
    See: https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge
-->
[![build status](https://github.com/D-Pow/mock-requests/actions/workflows/ci.yaml/badge.svg)](https://github.com/D-Pow/mock-requests/actions/workflows/ci.yaml)
[![coverage status](https://coveralls.io/repos/github/D-Pow/mock-requests/badge.svg?branch=master)](https://coveralls.io/github/D-Pow/mock-requests?branch=master)
[![install size](https://badgen.net/bundlephobia/minzip/mock-requests)](https://bundlephobia.com/package/mock-requests)

Mocks network requests with desired static and dynamic responses automatically so you
never have to change your source code to use mocks ever again.

#### Backed and Used by:

<!--
    We have to add a backup of absolute paths because they work while viewing the GitHub ReadMe file but not
    while viewing it on npmjs.com.

    Fix this by adding `<object data>` as a backup.

    See:
        - https://stackoverflow.com/questions/980855/inputting-a-default-image-in-case-the-src-attribute-of-an-html-img-is-not-vali/980910#980910
        - https://github.com/jsdoc/jsdoc/issues/2042
-->
* [<object data="https://raw.githubusercontent.com/D-Pow/mock-requests/master/.github/docs/etrade-logo.svg" type="image/png"><img src="./.github/docs/etrade-logo.svg" alt="E-Trade" /></object>](https://us.etrade.com)
* [<object data="https://raw.githubusercontent.com/D-Pow/mock-requests/master/.github/docs/nextdoor-logo.svg" type="image/png"><img src="./.github/docs/nextdoor-logo.svg" alt="Nextdoor" /></object>](https://nextdoor.com)

## Contents

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
    - [Quick note about usage in back-end or NodeJS scripts](#quick-note-about-usage-in-back-end-or-nodejs-scripts)
* [Examples](#examples)
    - [Static responses](#static-responses)
        + [Basic configuration](#basic-configuration)
        + [Mixing mocks with actual API calls](#mixing-mocks-with-actual-api-calls)
    - [Dynamic responses](#dynamic-responses)
        + [Modifying responses by payload](#modifying-responses-by-payload)
        + [Modifying responses by query parameters](#modifying-responses-by-query-parameters)
        + [Delaying resolution time](#delaying-resolution-time)
        + [Customizing response properties](#customizing-response-properties)
    - [Mocks based on different logins](#mocks-based-on-different-logins)
    - [Other utility functions](#other-utility-functions)
* [Separating mocks from source code](#separating-mocks-from-source-code)
    - [Bare-bones instructions](#bare-bones-instructions)
    - [Webpack Plugin/Activating via CLI](#webpack-pluginactivating-via-cli)
        + [Plugin options](#plugin-options)
    - [Further customization](#further-customization)
* [MockRequests API](#mockrequests-api)
* [Implementation notes](#implementation-notes)
* [License](#license)



## Features

This library was made for the purpose of allowing developers to be able to continue to write code
as normal even when their APIs are down, haven't been developed by back-end teams yet, or don't have
internet at all. It provides a quick, single point of entry that can be called once and will work
throughout your entire app.

In particular, most other network-mocking libraries are not user friendly in that they either:

* *Force users to re-write* their source code to use mocks and then *change it back later* in order
to use real network requests, or
* Involve *complex setup* using local servers and proxies, usually in ways that are app-specific and aren't easily
transferable to other projects.

This library differs from the others in that it allows you to continue **writing code as normal** while still
using mock network activity.

Specific benefits provided by this library that aren't offered in others:

* You **never have to change your source code**. This means no more replacing
`fetch()` with `Promise.resolve(mockResponse)`, and no changing URLs from `website.com/api` to `third-party-mocks.com/api`.
* **No painful configuration** of complex node servers, proxies, or anything else to host mock data.
This also means no need to change URLs from `website.com/api` to `localhost/api`.
* Full support for **use along with third-party libraries**, including [Axios](https://github.com/axios/axios) and
[jest](https://github.com/facebook/jest), so they function as normal while still giving you the mocks you want.
* **Dynamically update mock responses** based on request payloads, previous mock responses, and query parameters in
order to mimic back-end alterations of data.
* Query parameter parsing so you can **mock all URLs with the same pathname** using the same dynamic response function.
* Customizable **mock response delays** to mimic natural network resolution times.
* **Mix mocks with real API calls** so you can use both functional and non-functional endpoints simultaneously.
* Simple configuration to **split mock code from production code** and/or **activate mocks via terminal** (e.g. `MOCK=true npm start`).
* No confusing interfaces or multi-step procedures to getting started. Simply **configure it once** and you're good to go.
This becomes extremely useful if you want to **switch app-wide mocks between different logins** when developing.
* **Greatly simplify API testing**. Just define `fetch` and/or `XMLHttpRequest` in a test setup file and configure
`MockRequests` with the responses you expect. It will handle all the heavy-lifting of mocking network responses for you
so you don't have to repetitively use e.g. `fetch = jest.fn()`. See an example of the one-and-done [configuration](https://github.com/D-Pow/mock-requests/blob/master/demo/package.json#L55) and [testing](https://github.com/D-Pow/mock-requests/blob/master/demo/tests/services/Kitsu.spec.js) in the [demo](./demo).
* Compatible with **all JavaScript environments**, including back-end Node scripts, as long as either `fetch` or
`XMLHttpRequest` are defined and used in that environment (natively or by polyfill).



## Installation

* Using npm (see the [npm package](https://www.npmjs.com/package/mock-requests)):

    `npm install --save-dev mock-requests`

* Using git:

    - Via npm:

        `npm install --save-dev https://github.com/D-Pow/mock-requests.git`

    - With locally installed repo:

        `git clone https://github.com/D-Pow/mock-requests.git`

        package.json:

        `"mock-requests": "file:<pathToCloneLocation>/mock-requests`



## Usage

API docs can be viewed in the [JSDoc](https://d-pow.github.io/mock-requests/MockRequests.html) along with
a [live demo](https://d-pow.github.io/mock-requests/demo/).

This library wraps `XMLHttpRequest` and `fetch` such that any network request to a configured
URL will return the specified mock response instead of actually making the network requests.
Otherwise, if a URL hasn't been configured with a mock response, the standard async request is made.

`MockRequests` was designed to be used in such a way that wherever you configure it, the entire app
experiences the effects. This means you could configure it in one file and then all other files
that make network requests to the configured URLs will receive the mock responses instead,
even without importing `MockRequests`. This makes it very easy to work on the front-end even if
some APIs are down, haven't been developed yet, or if you have no internet access at all.


### Quick note about usage in back-end or NodeJS scripts

TL;DR: **It is highly recommended to use [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)** for any back-end/NodeJS scripts since it "just works" throughout your entire app just like MockRequests does.

<details>
    <summary>Network requests in general</summary>

MockRequests generally works with any third-party library because it doesn't alter the library itself, it only changes how `fetch`/`XMLHttpRequest` work. As such, `jest`, `axios`, etc. aren't affected since they only provide wrappers around the above without changing how they work.

However, MockRequests relies on those network functions being defined globally **before being imported**. So, if using a library that modifies those functions/objects, like [`node-fetch`](https://www.npmjs.com/package/node-fetch) does, you must *heed their warnings* to [add `fetch`, `Headers`, etc. as global variables](https://github.com/node-fetch/node-fetch/blob/37ac459cfd0eafdf5bbb3d083aa82f0f2a3c9b75/README.md#providing-global-access) **before** importing/`require`-ing MockRequests. In fact, this is exactly what `isomorphic-fetch` does - it imports `node-fetch` and then sets all the global variables for you (just like `node-fetch` itself recommends) so you don't have to.

In other words, this is the easiest way to make (and mock) network requests:

```javascript
// [any].mjs
import 'isomorphic-fetch'; // Automatically mocks `fetch()` globally for all files!
import MockRequests from 'mock-requests';

MockRequests.configure({
    [apiUrl]: { myKey: 'myVal' },
});

fetch(apiUrl); // Mocked easily and automatically!
```

as opposed to being forced to call `global.fetch()` instead of `fetch()`:

```javascript
// app.mjs
import * as NodeFetch from 'node-fetch';
// Don't import `fetch`/`Headers` individually to avoid polluting the script's namespace.
// Otherwise, you'd have to use `global.fetch(url, options)` so `global.fetch` is used
// rather than the local `fetch` function.
global.fetch = NodeFetch.default;
global.Headers = NodeFetch.Headers;

// Force `global[field] = field` to be set before importing MockRequests
const MockRequests = (await import('mock-requests')).default;

fetch(apiUrl); // Mocked, but cumbersome to setup. Same regardless of MJS or CJS.



// app.cjs equivalent

/* node-fetch@>=3 */
const NodeFetch = await import('node-fetch');
// Same concept as in MJS: Don't pollute the namespace to use `global.fetch` by default
global.fetch = NodeFetch.default;
global.Headers = NodeFetch.Headers;

const MockRequests = require('mock-requests');
// ... mock configuration/network calls

/* node-fetch@<=2 */
global.fetch = require('node-fetch');
global.Headers = fetch.Headers;

const MockRequests = require('mock-requests');
// ... mock configuration/network calls
```

or, alternatively, being forced to extract the polyfills to a separate file:

```javascript
// NetworkPolyfill.mjs
import fetch, { Headers } from 'node-fetch';

global.fetch = fetch;
global.Headers = Headers;


// app.mjs
import './NetworkPolyfill.js'; // Must be imported before MockRequests
import MockRequests from 'mock-requests';

MockRequests.configureDynamicResponses(...);

fetch(apiUrl); // Mocked, but requires splitting of network-setup logic to a separate file.
```

</details>

<details>
    <summary>Network requests using Axios in NodeJS</summary>

Currently, MockRequests only mocks `fetch` and `XMLHttpRequest`. When used in NodeJS scripts, Axios attempts using XHR first and falls back to using the NodeJS `http`/`https` modules if it doesn't exist ([source code ref](https://github.com/axios/axios/blob/master/lib/defaults.js#L17-L27)). Thus, an XHR polyfill must be added to use Axios in the live NodeJS code (but not Jest tests, as described in [Features](#features)).

Furthermore, there is a [bug in the NodeJS `xmlhttprequest` package](https://github.com/D-Pow/mock-requests/issues/15#issuecomment-891205355) caused by them not following the [correct WHATWG standard](https://xhr.spec.whatwg.org). Until MockRequests adds native support for the NodeJS `http`/`https` modules, an XHR polyfill library (like the one mentioned here) will have to be used in order to use `Axios` in back-end source code. In order to do so, write your code in a similar fashion to that described above:

```javascript
/* app.mjs */
// Don't pollute namespace by using dynamic imports
global.XMLHttpRequest = (await import('xmlhttprequest')).XMLHttpRequest;
// Force global fields to be defined before defining MockRequests and Axios
const MockRequests = (await import('mock-requests')).default;
const axios = (await import('axios')).default;
// ... your logic


/* app.js */
// First, the polyfill
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
// Next, MockRequests
const MockRequests = require('mock-requests');
// Finally, Axios
const axios = require('axios');
// ... your logic
```

</details>



## Examples

Note how in the below examples, the **production-bound code doesn't change** between
mocking and using network calls.


### Static responses

#### Basic configuration

To configure global app usage of `MockRequests`, simply call `configure()` with an object containing URL-responseObject
mappings.

```javascript
// This is the only code you need to add to use this library
// Add in the MockConfig.js file described in the "Separating
// mocks from source code" section
import MockRequests from 'mock-requests';
import {
    myApiUrl,   // 'https://example.com/api/vx/someApi'
    anotherUrl  // '192.168.0.1'
} from '../src/services/Urls.js';

const myApiMockResponse = { someJson: 'responseObject' };
const anotherUrlMockResponse = '<html>some other type of response</html>';

MockRequests.configure({
    [myApiUrl]: myApiMockResponse,
    [anotherUrl]: anotherUrlMockResponse
});

// ...source code

// Using your async requests in source code
// This stays the same regardless of if you're using mocks or the actual endpoint
const jsonResponse = await fetch(myApiUrl).then(res => res.json());
const htmlResponse = await fetch(anotherUrl).then(res => res.text());

useResponseContentAsNormal(jsonResponse);
useResponseContentAsNormal(htmlResponse);
```

Alternatively, you could configure URL-response content individually:

```javascript
// same URLs and mock responses from above
import MockRequests from 'mock-requests';

MockRequests.setMockUrlResponse(myApiUrl, myApiMockResponse);
MockRequests.setMockUrlResponse(anotherUrl, anotherUrlMockResponse);
```


#### Mixing mocks with actual API calls

In the event that some APIs are not functioning correctly but others are, you can configure
the broken APIs using `MockRequests` and then leave the other APIs as-is for normal responses:

```javascript
import MockRequests from 'mock-requests';
import { nonfunctionalApi } from '../src/services/Urls.js';

MockRequests.setMockUrlResponse(nonfunctionalApi, /* mock response */);

// ...source code

// Will receive mock
const mockedResponse = await fetch(nonfunctionalApi).then(res => res.json());
// Will receive actual API response
const realApiResponse = await fetch(functionalApi).then(res => res.json());

useResponseContent(mockedResponse);
useResponseContent(realApiResponse);
```


### Dynamic responses

#### Modifying responses by payload

This library also supports dynamically updating your mocked APIs' responses, so as to mimic actual
back-end systems. To utilize this feature, you'll need to call the dynamic counterparts of
`configure/setMockUrlResponse` (`configureDynamicResponses/setDynamicMockUrlResponse`) along with
a slightly modified config object that has `response` and `dynamicResponseModFn` fields:

```javascript
import MockRequests from 'mock-requests';
import { myApiUrl } from '../src/services/Urls.js';

const initialMockResponse = {
    data: ['a', 'b', 'c', 'd', 'e'],
    value: 7
};
const dynamicConfig1 = {
    [myApiUrl]: {
        // The desired response is now nested inside the `response` property.
        // This will be the initial default value of the `response` parameter
        // in the function below, but won't be used after that.
        response: initialMockResponse,
        // The dynamicResponseModFn takes in the request and previous
        // response as arguments to produce the new response.
        // The new response **must** be returned from this function.
        // Feel free to modify `response` as it will be deep-copied later.
        dynamicResponseModFn: (request, response) => {
            // Mix both request and response data to generate new response
            response.data = response.data.concat(request.addLettersArray);
            response.value += request.valueModification;

            return response; // is actually now the new response
        }
    }
};

MockRequests.configureDynamicResponses(dynamicConfig1);

// ...source code

const payload = {
    addLettersArray: ['f', 'g'],
    valueModification: 5
};
const myDynamicallyModifiedResponse = await fetch(myApiUrl, {
    body: JSON.stringify(payload)
}).then(res => res.json());

console.log(myDynamicallyModifiedResponse)

/* Will output:
{
    data: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    value: 12
}
*/
```


#### Modifying responses by query parameters

Additionally, the `dynamicResponseModFn` will receive an object containing query parameters from the request URL,
which means you also have the option to generate dynamic responses based on those.

If you want to mock all URLs with the same pathname but different query parameters, simply add `usePathnameForAllQueries: true`
to your dynamic mock configuration.

Regardless of if you set `usePathnameForAllQueries` or not, `dynamicResponseModFn` will still receive the `queryParamMap`.

```javascript
import {
    searchApiPathname  // 'https://example.com/search'  e.g. search?q=weather
} from '../src/services/Urls.js';

MockRequests.setDynamicMockUrlResponse(searchApiPathname, {
    // `response` field not needed because we don't need an initial `response` value
    dynamicResponseModFn: (request, response, queryParamMap) => {
        const searchQuery = decodeURIComponent(queryParamMap.q);
        return `You searched for ${searchQuery}`;
    },
    usePathnameForAllQueries: true
});

// ...source code

const searchQuery = getSearchFromTextInput(); // let's assume this is `weather`
const searchUrl = `${searchApiPathname}?q=${encodeURIComponent(searchQuery)}`;
const response = await fetch(searchUrl).then(res => res.text());

console.log(response);

/* Will output:
'You searched for weather'
*/
```


#### Delaying resolution time

There is also a `delay` option you can use if you want to mimic network delays:

```javascript
// or configureDynamicResponses({ [myApiUrl]: {...} })
MockRequests.setDynamicMockUrlResponse(myApiUrl, {
    response: myMockResponse,
    dynamicResponseModFn: (req, res, queries) => {/* ... */},
    delay: 1500   // will make fetch take 1.5 seconds to resolve myApiUrl
});
```


#### Customizing response properties

By default, `MockRequests` mocks `XMLHttpRequest` and `fetch` such that the response is always valid, setting the corresponding attributes' values as seen below. If you want to change any of these, use the `responseProperties` field of the `configureDynamicResponses()`/`setDynamicMockUrlResponse()` config objects.

For example, set `responseProperties.headers` to an object of HTTP header key/value pairs to change the response headers for both `XMLHttpRequest` and `fetch`, e.g. to change the status code from 200 to 400.

Note: The `status(Text)` properties are separate from the `status` HTTP header and need to be changed separately.

* For `XMLHttpRequest`:

    ```javascript
    xhr.readyState = 4;
    xhr.response = mockedResponse;
    xhr.responseText = stringVersionOf(mockedResponse); // e.g. JSON.stringify(mockedResponse)
    xhr.responseUrl = urlPassedInXhrOpenMethod;
    xhr.status = 200;
    xhr.statusText = 'OK';
    xhr.timeout = 0;
    ```

* For `fetch().then(response => ...)`:

    ```javascript
    response.status = 200;
    response.statusText = '';
    response.ok = true;
    response.headers = new Headers({ status: '200' });
    response.redirected = false;
    response.type = 'basic';
    ```



### Mocks based on different logins

Finally, because the `configure`/`setMockUrlResponse` functions take in a simple URL-response mapping,
using different mocks at different times becomes incredibly user-friendly. For example,
if your data changes based on which user is logged in, then the `MockRequests` API is
particularly easy to work with. In this case, after defining each user's mock responses,
you could nest them in a single `loginMocks` object and simply choose which login to use:

```javascript
const bobMocks = {
    [homepageUrl]: bobHomepageMock,
    [friendsUrl]: bobFriendsMock
};
const aliceMocks = {
    [homepageUrl]: aliceHomepageMock,
    [friendsUrl]: aliceFriendsMock
};
const loginMocks = {
    bob: bobMocks,
    alice: aliceMocks
};

// Today, I want to be Alice
MockRequests.configure(loginMocks.alice);
// no, wait, I'll be Bob instead
MockRequests.configure(loginMocks.bob);
```


### Other utility functions

For convenience, a `mapStaticConfigToDynamic()` function has been included to make converting the above
static version of `loginMocks` to the dynamic counterpart easier:

```javascript
// Example 1
// Convert a static URL-response mock to dynamic and add delay to home page
const dynamicBobMocks = MockRequests.mapStaticConfigToDynamic(bobMocks);
dynamicBobMocks[homepageUrl].delay = 1500;
MockRequests.configureDynamicResponses(dynamicBobMocks);

// Example 2
// Convert all loginMocks entries to dynamic counterparts
const dynamicLoginMocks = Object.keys(loginMocks).reduce((dynamicConfigs, user) => {
    dynamicConfigs[user] = MockRequests.mapStaticConfigToDynamic(loginMocks[user]);
    return dynamicConfigs;
}, {});
MockRequests.configureDynamicResponses(dynamicLoginMocks.bob);

// Example 3
// Merge user-agnostic dynamic mocks with static loginMocks
const dynamicMocks = {
    [searchApiPathname]: {
        dynamicResponseModFn: (req, res, queries) => {
            /* ... same as search query above */
        }
    }
};
const staticDynamicMerged = Object.keys(loginMocks).reduce((dynamicConfigs, user) => {
    dynamicConfigs[user] = {
        ...MockRequests.mapStaticConfigToDynamic(loginMocks[user]),
        ...dynamicMocks
    };
    return dynamicConfigs;
}, {});
MockRequests.configureDynamicResponses(staticDynamicMerged.bob);
```



## Separating mocks from source code

### Bare-bones instructions

In the simplest, bare-bones example, you could just import `MockRequests` into one of your entry JavaScript files
(src/index.js, src/App.js, or similar) and configure your mocks there. As long as MockRequests was installed as a
devDependency and you don't commit this code, it will never enter production.

```javascript
// src/index.js for React project
import React from 'react';
import ReactDOM from 'react-dom';
import App from '/components/App';

import MockRequests from 'mock-requests';

MockRequests.configure(/* ... */);

ReactDOM.render(<App />, document.getElementById('root'));
```

However, for larger apps with many network calls or for sharing mocks with other team members, typing and removing
mocks can get quite cumbersome. To simplify this, you could simply move mock-related code to a separate `mocks/`
folder and only import them when needed. This way, you can commit the mock code to your repo but, just like
test code, it doesn't get deployed into production since it isn't in the src/ folder.
For example, if we have the setup:

```
MyApp
├─── src/
|   ├─── (... source code)
├─── mocks/
|   ├─── MockConfig.js
|   ├─── StaticResponses.js
|   ├─── DynamicResponseConfigs.js
|   ├─── (... other mock files imported by MockConfig.js)
```

where `MockConfig.js` does all the `mock-requests` configuration, e.g.

```javascript
// mocks/MockConfig.js

import MockRequests from 'mock-requests';
import { myStaticApiUrl, myDynamicApiUrl } from '../src/services/Urls.js';
import { myStaticApiResponse } from './StaticResponses'; // Other files in mocks/
import { myDynamicApiConfig } from './DynamicResponseConfigs';

MockRequests.setMockUrlResponse(myStaticApiUrl, myStaticApiResponse);
MockRequests.setDynamicMockUrlResponse(myDynamicApiUrl, myDynamicApiConfig);
```

then in your src/index.js file, just import the MockConfig.js file to activate all mocks, and don't commit that
code change to keep all of it out of production:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from '/components/App';

import '../mocks/MockConfig';

ReactDOM.render(<App />, document.getElementById('root'));
```


<a id="webpack-pluginactivating-via-cli" name="webpack-pluginactivating-via-cli"></a>
### Webpack Plugin/Activating via CLI

To avoid having to change your source code to activate/deactivate mocks (e.g. src/index.js above), `MockRequests` comes with a built-in plugin for projects using [webpack](https://webpack.js.org/). As such, assuming you have a separate directory of mocks and a single mock entry file (see above example), you can simply import the `MockRequestsWebpackPlugin` and use via:

```javascript
// webpack.config.js
const MockRequestsWebpackPlugin = require('mock-requests/bin/MockRequestsWebpackPlugin');

module.exports = {
    // ...
    plugins: [
        // ...
         new MockRequestsWebpackPlugin(
            'mocks', // Holds all mock-related files imported by the entry file.
                     // Relative to the webpack "context"/project root (more on this below).
            'MockConfig.js', // Mock entry file, nested inside `mocks/`.
            process.env.MOCK === 'true' // Whether or not mocks should be activated.
        ),
        // ...
    ]
};
```

and run using `MOCK=true npm start`.

Use of this plugin will automatically transpile your code (according to your webpack config's JS/TS rules) and activate mocks based on the boolean of whether or not mocks should be activated. This means you never have to change anything in `src/` or in webpack.config.js outside of this plugin.

If the boolean condition resolves to `false`, then nothing will be added to your build output, keeping mock files out of the final production code. In this example, our toggle is via CLI env variable, but it can be anything else of your choosing.


#### Plugin options

The webpack plugin comes with a few configuration options to accommodate all types of webpack configurations:

```javascript
new MockRequestsWebpackPlugin(
    'mocks',
    'MockConfig.js',
    process.env.NODE_ENV === 'development',
    {
        pathsAreAbsolute,  // defaults to `false`
        transpileMocksDir // defaults to `true`
    }
),
```

If you prefer using absolute paths instead of relative, then change both the `mocksDir` and `mockEntryFile` arguments to be absolute, and set `pathsAreAbsolute: true`.

If you prefer to nest your `mocks/` directory inside `src/` or other directory that's already configured to be transpiled, then set `transpileMocksDir: false` for added simplicity in webpack processing.


### Further customization

If your project doesn't use webpack or if you prefer to have more control over the file-processing, then you could instead use the `resolve-mocks.js` script to generate the paths to the mock directory/entry-file manually.

All you have to do is pass in the same fields from the `MockRequestsWebpackPlugin` into the `resolveMocks()` function, and spread the resulting `entry`/`include` arrays where you want them processed. For example:

```javascript
// webpack.config.js

// Returns an object containing arrays to spread in webpack's `include` and `entry` fields.
// resolveMocks(mockDirectory, mockEntryFile, activateMocksBoolean)
const resolveMocks = require('mock-requests/bin/resolve-mocks');
const resolvedMocks = resolveMocks('mocks', 'mocks/MockConfig.js', process.env.MOCK === 'true');

module.exports = {
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                // adds mocks/ directory to loaders for transpilation
                include: [ /src/, ...resolvedMocks.include ],
                exclude: [ /node_modules/ ],
                loader: 'babel-loader'
            }
        ]
    },
    // adds mocks/MockConfig.js entry file to build output
    entry: [ '@babel/polyfill', './src/index.js', ...resolvedMocks.entry ]
}
```

and run using `MOCK=true npm start`.

Doing so will result in the same outcome of the webpack plugin: transpilation of the `mocks/` directory so you can write your mocks with the latest JS features, as well as adding the mock entry file to your build/run output dynamically -- all while still being toggled by the CLI. Like the plugin, the mocks won't be added to your build output unless the boolean condition resolves to `true`.



## MockRequests API

In order to make mocking your network calls simpler, config functions have been added to allow for
setting, getting, and deleting mock responses for your network calls.

These are described at length in the [JSDoc](https://d-pow.github.io/mock-requests/MockRequests.html).

* **configure(staticUrlResponseConfigObject, overwritePreviousConfig = true)**
* **configureDynamicResponses(dynamicUrlResponseConfigObject, overwritePreviousConfig = true)**
* **setMockUrlResponse(url, staticMockResponseObject)**
* **setDynamicMockUrlResponse(url, dynamicMockResponseObject)**
* **getResponse(url)**
* **deleteMockUrlResponse(urlNotMeantToBeMocked)**
* **clearAllMocks()**
* **mapStaticConfigToDynamic(staticConfig)**
* **OriginalXHR()**
* **originalFetch()**

Note that `OriginalXHR` and `originalFetch` will use the original `XMLHttpRequest` and `fetch` respectively,
regardless of if you've set the mock URL responses in `MockRequests.configure()` or `MockRequests.setMockUrlResponse(...)`.
It will also use `XMLHttpRequest` and `fetch` regardless of if the browser supports them or not (will be `undefined` in
cases where the browser doesn't support them).



## Implementation notes

1. This library also works with other members of the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API#Fetch_Interfaces),
so you can alternatively use an instance of the `Request` class in your `fetch()` calls (e.g. `fetch(new Request(url, options))`) or read from the `Headers` instance of `response.headers`.

2. You may import either the `MockRequests` default export or any of its individual fields, e.g. <br />
`import MockRequests, { setMockUrlResponse } from 'mock-requests';`

3. This works with any environment that uses either `fetch` or `XMLHttpRequest`, regardless of if said
environment is a browser, web/service worker, or a NodeJS script. As long as `fetch` and/or `XMLHttpRequest` are defined **globally** (whether natively or
by polyfill), any network request to a URL configured by `MockRequests` will be
mocked appropriately. For example:

    ```javascript
    // my-script.js - called via `node my-script.js`
    require('isomorphic-fetch');

    const MockRequests = require('mock-requests');

    // ... use fetch and MockRequests as normal
    ```



## License

[MIT](./LICENSE.md)
