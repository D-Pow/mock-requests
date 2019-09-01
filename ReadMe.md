# RequestMock

Mocks async requests with response requests so you can continue
to use your requests/libraries without having to mock every single request
when you need to.

Note: tested and validated with `Axios@0.17.0`; 

## Features

Wraps `XMLHttpRequest` and `fetch` with a wrapper that
allows for mock responses to be returned instead of actually
making async requests.

If the URL-mockResponse is configured,
it returns the configured mock response; otherwise, the
async request is made.

Designed to work along with third-party libraries, including [Axios](https://github.com/axios/axios).

## Installation

Using npm:

`npm install request-mock`

Using locally installed repo with git:

`git clone <this repo>`

package.json:

`"request-mock": "file:<pathToCloneLocation>:/RequestMock`

## Usage

`RequestMock` was designed to be used in such a way that wherever you configure
it, the entire app experiences the effects. This means you could configure it in one file
and then all files that call that API will receive the mock response instead (assuming
you configure it in a top-level file whose parsing is done before latter files).

Furthermore, it is designed specifically when some APIs are not functioning correctly
and a mock is necessary to replace some API responses for continuing your work.
However, replacing all API responses is still a valid use of this library.

## Examples

```javascript
const myApiUrl = 'https://mywebsite.com/api/vx/someApi'

RequestMock.configure({
    [myApiUrl]: { data: 'someResponse' },
    '192.168.0.1': '<html>some other type of response</html>'
});

// ...other code

// when you actually need to make async requests
// Note that this part DOESN'T CHANGE between using mocks and actual data
// from your service 
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
This means that, in particular for `XMLHttpRequest`, that the following instance attributes are always
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

## License

MIT
