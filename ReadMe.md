# RequestMock

Mocks async requests with mock responses so you can continue
to use your requests/libraries without having to manually replace the
usage of async functions with mocks.

## Features

This library was made for the purpose of allowing developers to be able to
continue to write their code as normal even when their network or APIs are down.
In particular, most other network-mocking libraries are not user friendly in that they
**force users to re-write** their code to use mocks and then **change it back later** in order
to use real network requests. This library differs from all the others in that it allows
you to continue writing code **as normal** while still using mock network activity.

Specific benefits provided by this library that aren't offered in others:
* You don't have to replace your usage of async calls with mocks (that means no more replacing `fetch` with `Promise.resolve(desiredResponse)`)!
* You don't have to do any painful configuration, such as running your own server, to host mock data
(which also means no need to change URLs from `website.com/api` to `localhost/api`).
* No confusing interfaces or multi-step procedures to getting started. Simply configure it *once* in your
source code and you're good to go!
* This is designed to work along with third-party libraries, including [Axios@0.17.0](https://github.com/axios/axios),
so they function as normal while still giving you the mocks you want.
* This can easily be used alongside `jest` for testing! As long as `fetch` and `XMLHttpRequest` are defined in
a test setup file, you can use this library as normal to mock all async responses.

## Installation

Using npm:

`npm install mock-requests`

Using locally installed repo with git:

`git clone <this repo>`

package.json:

`"mock-requests": "file:<pathToCloneLocation>:/RequestMock`

## Usage

This library wraps `XMLHttpRequest` and `fetch` with a wrapper that allows
for mock responses to be returned instead of actually making async requests.
If the URL-mockResponse is configured, it returns the configured mock response;
otherwise, the async request is made.

This was designed to be used in such a way that wherever you configure
it, the entire app experiences the effects. This means you could configure it in one file
and then all files that call that API will receive the mock response instead (assuming
you configure it in a file that's parsed before other files make network calls).

Furthermore, it is designed specifically when some APIs are not functioning correctly
and a mock is necessary to replace some API responses for continuing your work.
However, replacing all API responses is still a valid use of this library.

## Examples

Note how in the below examples, the *only* part that differs from using normal, production-bound code
and mock code is the `RequestMock.function()` calls! No other configuration/code changes necessary.

```javascript
const myApiUrl = 'https://mywebsite.com/api/vx/someApi'

RequestMock.configure({
    [myApiUrl]: { data: 'someResponse' },
    '192.168.0.1': '<html>some other type of response</html>'
});

// ...other code

// when you actually need to make async requests
// Note that this part DOESN'T CHANGE between using mocks and actual data
// from your service !
const mockedHtmlResponse = await fetch('192.168.0.1', {...configOptions})
                                .then(res => res.json());
useResponseContentAsNormal(mockedHtmlResponse);
```

Alternatively, if you configure some URL-response content separately from other files and
decide that you need to set other URL mocks elsewhere, you can set them separately:

```javascript
// other file
const myForgottenUrl = 'https://myotherapi.thatIforgotOriginally/api/vx/something';

RequestMock.setMockUrlResponse(myForgottenUrl, { data: 'myOtherResponse' });

...

const otherResponseDataUsage = await fetch(myForgottenUrl, {...whateverOptions});

useResponseContent(otherResponseDataUsage);
```

Finally, in the event that some APIs are not functioning correctly but some are, you can configure
the non-functioning APIs using `RequestMock` and then leave the other APIs as-is for proper responses:

```javascript
const myNonFunctioningApi = 'https://myapi.com/api/vx/notFunctioningRightNow';
const myFunctioningApi = 'https://myapi.com/api/vx/isFunctioningProperly';

RequestMock.setMockUrlResponse(myNonFunctioningApi, { data: 'myOtherResponse' });

...

// Will receive mock
const mockedResponse = await fetch(myNonFunctioningApi, {...whateverOptions});
// Will receive actual API response
const realApiResponse = await fetch(myFunctioningApi, {...whateverOptions});

useResponseContent(mockedResponse);
useResponseContent(realApiResponse);
```

## RequestMock API

In order to make mocking your API calls simpler, APIs have been added to allow for setting,
getting, and deleting mock responses for certain API calls: 

##### configure(originalUrlResponseConfigObject)
##### setMockUrlResponse(extraUrl, mockResponseObject)
##### getResponse(url)
##### deleteMockUrlResponse(urlNotMeantToBeMocked)
##### clearAllMocks()
##### OriginalXHR()
##### originalFetch()

Note that `OriginalXHR` and `originalFetch` will use the original `XMLHttpRequest` and `fetch` respectively,
regardless of if you've set the mock URL responses in `RequestMock.configure()` or `RequestMock.setMockUrlResponse(...)`.
It will also use `XMLHttpRequest` and `fetch` regardless of if the browser supports them or not (will be `undefined` in
cases where the browser doesn't support them).

## RequestMock.configure

To configure global app usage of `RequestMock`, simply call `configure()` with an object containing URL-responseObject
mappings, as mentioned above:

```javascript
const myMockedResponseConfig = {
    [myApiUrl]: { data: 'someResponse' },
    '192.168.0.1': '<html>some other type of response</html>'
};

RequestMock.configure(myMockedResponseConfig);
``` 

## Final notes

This mocks the usage of `XMLHttpRequest` and `fetch` such that the response is always valid.
This means that, in particular for `XMLHttpRequest`, the following instance attributes are always
set:

```javascript
xhr.readyState = 4;
xhr.response = mockedResponse;
xhr.responseText = stringVersionOf(mockedResponse); // either JSON.stringify(mockedResponse) or `${mockedResponse}`
xhr.responseUrl = urlPassedInXhrOpenMethod;
xhr.status = 200;
xhr.statusText = 'OK';
xhr.timeout = 0;
```

If you want to change any of these, feel free to do so before calling `xhr.send()` or within `xhr.onreadystatechange`.

## License

MIT
