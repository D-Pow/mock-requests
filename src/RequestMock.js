/**
 * RequestMock will mock both XMLHttpRequest and fetch such that
 * any requested URL will return the specified mock object instead
 * of actually making an async request. URLs not configured will
 * still trigger an async request.
 *
 * @module mock-requests
 */
/**
 * @typedef {Object} RequestMock
 * @global
 * @property {function} configure
 * @property {function} setMockUrlResponse
 * @property {function} getResponse
 * @property {function} deleteMockUrlResponse
 * @property {function} clearAllMocks
 * @property {function} OriginalXHR
 * @property {function} originalFetch
 */
/**
 * @type {RequestMock}
 */
const RequestMock = (function() {
    /**
     * @typedef {function} DynamicResponseModFn
     * @param {*} request - Payload passed to the async function
     * @param {*} response - Previous response object to be modified
     * @returns {*} modifiedResponse - Updated response to be saved in the mock response map
     */
    /**
     * @typedef {Object} MockResponseConfig
     * @property {Object} response - Mock response to be returned
     * @property {DynamicResponseModFn} dynamicResponseModFn - Function to dynamically change the response object based on previous request/response
     */

    /**
     * @type {Object.<string, MockResponseConfig>} urlResponseMap - key (URL string) value (mock response) pairs for network mocks
     */
    let urlResponseMap = {};

    let OriginalXHR;
    let originalFetch;

    /**
     * Initialize the mock
     *
     * @param  {Object.<string, Object>} apiUrlResponseConfig - Config object containing URL strings as keys and respective mock response objects as values
     */
    function configure(apiUrlResponseConfig = {}) {
        urlResponseMap = deepCopyObject(apiUrlResponseConfig);
    }

    /**
     * Mock any network requests to the given URL using the given responseObject
     *
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

    /**
     * Deletes the URL and respective mock object
     *
     * @param url
     * @returns {boolean}
     */
    function deleteMockUrlResponse(url) {
        return delete urlResponseMap[url];
    }

    /**
     * Deletes all entries in the RequestMock configuration
     */
    function clearAllMocks() {
        urlResponseMap = {};
    }

    /**
     * Deep copies a JS object
     *
     * @param {Object} obj
     * @returns {Object}
     */
    function deepCopyObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Gets the `responseText` for XHR or `res.text()` for fetch.
     *
     * @param {*} response
     */
    function castToString(response) {
        return typeof response === typeof {} ? JSON.stringify(response) : `${response}`;
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
        OriginalXHR = XMLHttpRequest;

        XMLHttpRequest = function() {
            const xhr = new OriginalXHR();

            function mockXhrRequest() {
                const mockedResponse = urlResponseMap[xhr.url];
                const mockedValues = {
                    readyState: 4,
                    response: mockedResponse,
                    responseText: castToString(mockedResponse),
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
        originalFetch = fetch;

        fetch = function(url, options) {
            if (Object.keys(urlResponseMap).includes(url)) {
                const responseBody = urlResponseMap[url];
                const response = {
                    json: () => Promise.resolve(responseBody),
                    text: () => Promise.resolve(castToString(responseBody))
                };

                return Promise.resolve(response);
            } else {
                return originalFetch(url, options);
            }
        }
    }

    if (window.XMLHttpRequest) {
        overwriteXmlHttpRequestObject();
    }

    if (window.fetch) {
        overwriteFetch();
    }

    return {
        configure,
        setMockUrlResponse,
        getResponse,
        deleteMockUrlResponse,
        clearAllMocks,
        OriginalXHR,
        originalFetch
    };
})();

export default RequestMock;
