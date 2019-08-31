/**
 * RequestMock will mock both XMLHttpRequest and fetch such that
 * any requested URL will return the specified mock object instead
 * of actually making an async request.
 */
const RequestMock = (function() {
    /**
     * @type {Object.<string, Object>} urlResponseMap - key (URL string) value (mock response) pairs for network mocks
     */
    let urlResponseMap = {};

    /**
     * Initialize the mock
     *
     * @param  {Object.<string, Object>} apiUrlResponseConfig - Config object containing URL strings as keys and respective mock response objects as values
     */
    function configure(apiUrlResponseConfig = {}) {
        urlResponseMap = apiUrlResponseConfig;
    }

    /**
     * Mock any network requests to the given URL using the given responseObject
     * @param {string} url
     * @param {Object} responseObject
     */
    function setMockUrlResponse(url, responseObject) {
        urlResponseMap[url] = responseObject;
    }

    /**
     * Get the mock response object associated with the passed URL
     *
     * @param {string} url
     * @returns {Object} - Configured response object
     */
    function getResponse(url) {
        return urlResponseMap[url];
    }

    function deleteMockUrlResponse(url) {
        return delete urlResponseMap[url];
    }

    /**
     * Overwrites the XMLHttpRequest function with a wrapper that
     * mocks the readyState, status, statusText, and various other
     * fields that depend on the status of the request, and applies
     * the mock object response to the `xhr.response` field.
     *
     * The wrapper always marks the request as successful,
     * e.g. status = 200 and statusText = 'OK'
     */
    function overwriteXmlHttpRequestObject() {
        const OriginalXHR = XMLHttpRequest;

        XMLHttpRequest = function() {
            const xhr = new OriginalXHR();

            function mockXhrRequest() {
                const mockedValues = {
                    readyState: 4,
                    response: urlResponseMap[xhr.url],
                    responseText: JSON.stringify(urlResponseMap[xhr.url]),
                    responseUrl: xhr.url,
                    status: 200,
                    statusText: 'OK',
                    timeout: 0
                };
                const properties = Object.keys(mockedValues).reduce((definedProperties, key) => {
                    definedProperties[key] = {
                        get: () => mockedValues[key],
                        set: val => mockedValues[key] = val
                    };

                    return definedProperties;
                }, {});

                Object.defineProperties(xhr, properties);
            }

            xhr.originalOpen = xhr.open;
            xhr.open = function(method, url, ...args) {
                xhr.url = url;

                if (Object.keys(urlResponseMap).includes(url)) {
                    xhr.isMocked = true;
                    mockXhrRequest();
                }

                xhr.originalOpen(method, url, ...args);
            };

            xhr.originalSend = xhr.send;
            xhr.send = function(requestBody) {
                xhr.requestBody = requestBody;

                if (xhr.isMocked) {
                    xhr.onreadystatechange();
                } else {
                    xhr.originalSend(requestBody);
                }
            };

            return xhr;
        }
    }

    function overwriteFetch() {
        const originalFetch = fetch;

        fetch = function(url, options) {
            if (Object.keys(urlResponseMap).includes(url)) {
                const responseBody = urlResponseMap[url];
                const response = {
                    json: () => Promise.resolve(responseBody),
                    text: () => Promise.resolve(JSON.stringify(responseBody))
                };

                return Promise.resolve(response);
            } else {
                return originalFetch(url, options);
            }
        }
    }

    if (XMLHttpRequest) {
        overwriteXmlHttpRequestObject();
    }

    if (fetch) {
        overwriteFetch();
    }

    return {
        configure,
        setMockUrlResponse,
        getResponse,
        deleteMockUrlResponse
    };
})();

export default RequestMock;
