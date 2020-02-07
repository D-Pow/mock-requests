# MockRequests

[![build status](https://travis-ci.org/D-Pow/MockRequests.svg?branch=master)](https://travis-ci.org/D-Pow/MockRequests)
[![coverage status](https://coveralls.io/repos/github/D-Pow/MockRequests/badge.svg?branch=master)](https://coveralls.io/github/D-Pow/MockRequests?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=mock-requests)](https://packagephobia.now.sh/result?p=mock-requests)

Mocks async requests with mock responses so you can continue
to use your requests/libraries without having to manually replace the
usage of async functions with mocks.

## Contents

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Examples](#examples)
    * [Static responses](#example-static)
    * [Dynamic responses](#example-dynamic)
* [Separating mocks from source](#separate-from-source)
* [MockRequests API](#api)
* [Final notes](#final-notes)
* [License](#license)

<a name="features"></a>
## Features

This library was made for the purpose of allowing developers to be able to
continue to write their code as normal even when their APIs are down, not set up yet, or
don't have internet at all.
In particular, most other network-mocking libraries are not user friendly in that they either
*force users to re-write* their source code to use mocks and then *change it back later* in order
to use real network requests or involve *complex setup* using local servers and proxies. This library
differs from the others in that it allows you to continue **writing code as normal** while still
using mock network activity.

Specific benefits provided by this library that aren't offered in others:
* You **don't have to replace your usage of async calls with mocks**.
This means no more replacing `fetch` with `Promise.resolve(mockResponse)`!
* There is **no painful configuration**, such as running your own server, to host mock data.
This also means no need to change URLs from `website.com/api` to `localhost/api`.
* No confusing interfaces or multi-step procedures to getting started. Simply **configure it once** and you're good to go.
* This is designed to **work along with third-party libraries**, including [Axios](https://github.com/axios/axios),
so they function as normal while still giving you the mocks you want.
* This can easily be **used with** `jest` for testing! As long as `fetch` and/or `XMLHttpRequest` are defined in
a test setup file, you can use this library as normal to mock all async responses.
* Easily **mix mocks with actual API calls** so you can use both functional and non-functional endpoints simultaneously.
* Configurable outside the src folder such that **mock code isn't bundled with production code**.
* **Dynamically update mock responses** based on request payloads, previous mock responses, and query parameters in
order to mimic normal back-end alterations of data.
* Query parameter parsing so you can **mock all URLs with the same pathname** to the same dynamic response function.
* Customizable mock response resolution delay to **mimic natural network resolution times**.

<a name="installation"></a>
## Installation

* Using npm (see the [npm package](https://www.npmjs.com/package/mock-requests)):

    `npm install --save-dev mock-requests`

* Using git:

    * Via npm:

        `npm install --save-dev https://github.com/D-Pow/MockRequests.git`
    * With locally installed repo:

        `git clone https://github.com/D-Pow/MockRequests.git`

        package.json:

        `"mock-requests": "file:<pathToCloneLocation>/MockRequests`

<a name="usage"></a>
## Usage

API docs can be viewed in the [JSDoc](https://d-pow.github.io/MockRequests/module-mock-requests-MockRequests.html) along with
a [live demo](https://d-pow.github.io/MockRequests/demo/).

This library wraps `XMLHttpRequest` and `fetch` with a wrapper that allows
for mock responses to be returned instead of actually making async requests.
If a URL is configured with a mock response, then `XMLHttpRequest` and `fetch` will
return the configured mock response when opened with that URL. Otherwise, when opened
with a URL that isn't configured with a mock response, the standard async request is made.

This was designed to be used in such a way that wherever you configure it, the entire app
experiences the effects. This means you could configure it in one file and then all other code
that make async requests to those configured URLs will receive the mock responses instead,
even without importing `MockRequests`.

Furthermore, it is designed to be used specifically when some APIs are not functioning correctly
and mocks are necessary to replace those responses for continuing your work. In this regard,
it is also great to use when the back-end API is still being developed but you want to work on the
front-end, or when you don't have internet at all but still need to get work done.

<a name="examples"></a>
## Examples

Note how in the below examples, the **production-bound code doesn't change** between
mocking and using network calls.

<a name="example-static"></a>
### Static responses

#### Standard configuration

To configure global app usage of `MockRequests`, simply call `configure()` with an object containing URL-responseObject
mappings.

```javascript
// This is the only code you need to add to use this library
// Add in the MockConfig.js file described by "Separating mocks
// from source code" section
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
the non-functioning APIs using `MockRequests` and then leave the other APIs as-is for normal responses:

```javascript
import MockRequests from 'mock-requests';
import {
    myNonFunctioningApi,
    myFunctioningApi
} from '../src/services/Urls.js';

MockRequests.setMockUrlResponse(myNonFunctioningApi, /* mock response */);

// ...source code

// Will receive mock
const mockedResponse = await fetch(myNonFunctioningApi).then(res => res.json());
// Will receive actual API response
const realApiResponse = await fetch(myFunctioningApi).then(res => res.json());

useResponseContent(mockedResponse);
useResponseContent(realApiResponse);
```

<a name="example-dynamic"></a>
### Dynamic responses

#### Dynamically modifying subsequent responses

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
        // in the function below.
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

#### Mocking families of URLs using query parameters

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
    dynamicResponseModFn: (request, response, queryParamMap) => {
        const searchQuery = decodeURIComponent(queryParamMap.q);
        return `You searched for ${searchQuery}`;
    },
    usePathnameForAllQueries: true
});

// ...source code

const searchQuery = getSearchFromTextInput(); // let's assume this is `weather`
const searchUrl = `${searchApiPathname}?q=${encodeURIComponent(searchQuery)}`;
const response = await fetch(searchUrl);
const dynamicResponseBasedOnQueryParam = await response.text();

console.log(dynamicResponseBasedOnQueryParam);

/* Will output:
'You searched for weather'
*/
```

#### Delaying mock response resolutions

There is also a `delay` option you can use if you want to mimic network delays:

```javascript
// or configureDynamicResponses({ [myApiUrl]: {...} })
MockRequests.setDynamicMockUrlResponse(myApiUrl, {
    response: myMockResponse,
    dynamicResponseModFn: (req, res, queries) => {/* ... */},
    delay: 1500   // will make fetch take 1.5 seconds to resolve myApiUrl
});
```

#### Sample usage with different logins

Finally, because the configuration/setter functions take in a simple url-response mapping,
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

#### Other utility functions

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

<a name="separate-from-source"></a>
## Separating mocks from source code

To avoid packaging `MockRequests` and mock-related code along with your production-bound source code, you can simply
move your mock files to a separate folder and add a small modification to your webpack config object's `entry` array.
Optionally, you can also add a similar modification to the `module.rules[jsRule].include` array, depending on your
application's setup. Luckily, `MockRequests` comes bundled with a node script to make this easier. For example, if we have
the setup:

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
import MockRequests from 'mock-requests';
import { myStaticApiUrl, myDynamicApiUrl } from '../src/services/Urls.js';
// Imports from mocks/ directory
import { myStaticApiResponse } from './StaticResponses';
import { myDynamicApiConfig } from './DynamicResponseConfigs';

MockRequests.setMockUrlResponse(myStaticApiUrl, myStaticApiResponse);
MockRequests.setDynamicMockUrlResponse(myDynamicApiUrl, myDynamicApiConfig);
```

and your original `webpack.config.js` looked something similar to:

```javascript
module.exports = {
    entry: [ '@babel/polyfill', './src/index.js' ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [ /src/ ],
                exclude: [ /node_modules/ ],
                loader: 'babel-loader'
            }
        ]
    }
}
```

then all you would need to add to your `webpack.config.js` file would be something akin to:

```javascript
// Returns an object containing arrays to spread in webpack's `include` and `entry` fields.
// resolveMocks(mockDirectory, mockEntryFile, activateMocksBoolean)
const resolveMocks = require('mock-requests/bin/resolve-mocks');
const resolvedMocks = resolveMocks('mocks', 'mocks/MockConfig.js', process.env.MOCK === 'true');

module.exports = {
    entry: [ '@babel/polyfill', './src/index.js', ...resolvedMocks.entry ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [ /src/, ...resolvedMocks.include ],
                exclude: [ /node_modules/ ],
                loader: 'babel-loader'
            }
        ]
    }
}
```

and run using `MOCK=true npm start`.

Doing so will have the net effect of adding the `MockConfig.js` file as an entry point to your app so that it's
loaded along with the rest of your code. Optionally, if you're using the latest JavaScript features in your
mock configuration files but want to run them on browsers that lack support, then you'll need those mock files transpiled
by your loader as well; in that case, add the respective spread to the `include` field as well.

Note that your webpack configuration won't have to change between activating and deactivating your mocks. The third
parameter to `resolveMocks()` will determine if the mock files should be included or not (in this example, the condition
is true only if `MOCK=true` is passed as a node environment variable when running `npm start`). If the argument passed
resolves to a falsy value, then empty arrays will be returned, so no mock code will be injected into the built package.
This way, all mock-related code will be prevented from going into production.

<a name="api"></a>
## MockRequests API

In order to make mocking your network calls simpler, config functions have been added to allow for
setting, getting, and deleting mock responses for your network calls. These are described at length
in the [JSDoc](https://d-pow.github.io/MockRequests/module-mock-requests-MockRequests.html).

##### configure(staticUrlResponseConfigObject, overwritePreviousConfig = true)
##### configureDynamicResponses(dynamicUrlResponseConfigObject, overwritePreviousConfig = true)
##### setMockUrlResponse(url, staticMockResponseObject)
##### setDynamicMockUrlResponse(url, dynamicMockResponseObject)
##### getResponse(url)
##### deleteMockUrlResponse(urlNotMeantToBeMocked)
##### clearAllMocks()
##### mapStaticConfigToDynamic(staticConfig)
##### OriginalXHR()
##### originalFetch()

Note that `OriginalXHR` and `originalFetch` will use the original `XMLHttpRequest` and `fetch` respectively,
regardless of if you've set the mock URL responses in `MockRequests.configure()` or `MockRequests.setMockUrlResponse(...)`.
It will also use `XMLHttpRequest` and `fetch` regardless of if the browser supports them or not (will be `undefined` in
cases where the browser doesn't support them).

<a name="final-notes"></a>
## Final notes

1) This mocks the usage of `XMLHttpRequest` and `fetch` such that the response is always valid.
This means that the instance attributes below are always set. If you want to change any of these, feel free to do
so within `xhr.onreadystatechange`/`fetch().then(fn)`.

    For `XMLHttpRequest`:
    ```javascript
    xhr.readyState = 4;
    xhr.response = mockedResponse;
    xhr.responseText = stringVersionOf(mockedResponse); // either JSON.stringify(mockedResponse) or `${mockedResponse}`
    xhr.responseUrl = urlPassedInXhrOpenMethod;
    xhr.status = 200;
    xhr.statusText = 'OK';
    xhr.timeout = 0;
    ```

    For `fetch().then(response => ...)`:
    ```javascript
    response.status = 200;
    response.statusText = '';
    response.ok = true;
    response.headers = new Headers({ status: '200' });
    response.redirected = false;
    response.type = 'basic';
    ```

2) This library also works with other members of the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API#Fetch_Interfaces),
so you can alternatively use an instance of the `Request` class in your `fetch()` calls, e.g. `fetch(new Request(url, options))`.

3) You may import either the `MockRequests` default export or any of its individual fields, e.g. <br />
`import MockRequests, { setMockUrlResponse } from 'mock-requests';`

<a name="license"></a>
## License

MIT
