/**
 * MockRequests will mock both XMLHttpRequest and fetch such that
 * any requested URL will return the specified mock object instead
 * of actually making an async request. URLs not configured will
 * still trigger an async request.
 *
 * @module mock-requests
 */
/**
 * @typedef {Object} MockRequests
 * @global
 * @property {function} configure
 * @property {function} configureDynamicResponses
 * @property {function} setMockUrlResponse
 * @property {function} setDynamicMockUrlResponse
 * @property {function} getResponse
 * @property {function} deleteMockUrlResponse
 * @property {function} clearAllMocks
 * @property {function} OriginalXHR
 * @property {function} originalFetch
 */
/**
 * @type {MockRequests}
 */
const MockRequests = (function() {
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
     * Initialize the mock with response objects.
     *
     * @param  {Object.<string, Object>} apiUrlResponseConfig - Config object containing URL strings as keys and respective mock response objects as values
     * @param {boolean} [overwritePreviousConfig=true] - If the map from a previous configure call should be maintained (true) or not (false)
     */
    function configure(apiUrlResponseConfig = {}, overwritePreviousConfig = true) {
        const newUrlResponseMap = Object.keys(apiUrlResponseConfig).reduce((mockResponses, key) => {
            mockResponses[key] = {
                response: deepCopyObject(apiUrlResponseConfig[key]),
                dynamicResponseModFn: null,
                delay: null
            };
            return mockResponses;
        }, {});

        if (overwritePreviousConfig) {
            urlResponseMap = newUrlResponseMap;
        } else {
            urlResponseMap = { ...urlResponseMap, ...newUrlResponseMap };
        }
    }

    /**
     * Initialize the mock with response objects and their dynamic update functions
     *
     * @param {Object<string, MockResponseConfig>} dynamicApiUrlResponseConfig
     * @param {boolean} [overwritePreviousConfig=true] - If the map from a previous configure call should be overwritten by this call (true) or not (false)
     */
    function configureDynamicResponses(dynamicApiUrlResponseConfig = {}, overwritePreviousConfig = true) {
        const newUrlResponseMap = Object.keys(dynamicApiUrlResponseConfig).reduce((mockResponses, key) => {
            mockResponses[key] = {
                response: deepCopyObject(dynamicApiUrlResponseConfig[key].response || null),
                dynamicResponseModFn: dynamicApiUrlResponseConfig[key].dynamicResponseModFn,
                delay: dynamicApiUrlResponseConfig[key].delay
            };
            return mockResponses;
        }, {});

        if (overwritePreviousConfig) {
            urlResponseMap = newUrlResponseMap;
        } else {
            urlResponseMap = { ...urlResponseMap, ...newUrlResponseMap };
        }
    }

    /**
     * Mock any network requests to the given URL using the given responseObject
     *
     * @param {string} url - URL to mock
     * @param {Object} response - Mock response object
     */
    function setMockUrlResponse(url, response = null) {
        const mockResponseConfig = urlResponseMap[url] ? urlResponseMap[url] : { response: null, dynamicResponseModFn: null };

        mockResponseConfig.response = deepCopyObject(response);
        urlResponseMap[url] = mockResponseConfig;
    }

    /**
     * Mock any network requests to the given URL using the given responseObject
     * and dynamic response modification function
     *
     * @param {string} url - URL to mock
     * @param {Object} response - Mock response object
     * @param {function} dynamicResponseModFn - Function to update response object from previous request/response values
     */
    function setDynamicMockUrlResponse(url, { response, dynamicResponseModFn } = {}) {
        const mockResponseConfig = urlResponseMap[url] ? urlResponseMap[url] : { response: null, dynamicResponseModFn: null };

        if (response) {
            mockResponseConfig.response = deepCopyObject(response);
        }

        if (dynamicResponseModFn && typeof dynamicResponseModFn === 'function') {
            mockResponseConfig.dynamicResponseModFn = dynamicResponseModFn;
        } else {
            mockResponseConfig.dynamicResponseModFn = null;
        }

        urlResponseMap[url] = mockResponseConfig;
    }

    /**
     * Get the mock response object associated with the passed URL
     *
     * @param {string} url
     * @returns {*} - Configured response object
     */
    function getResponse(url) {
        return urlResponseMap[url] ? urlResponseMap[url].response : undefined;
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
     * Deletes all entries in the MockRequests configuration
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

    function urlIsMocked(url) {
        return Object.keys(urlResponseMap).includes(url);
    }

    /**
     * Parse payload content from fetch/XHR such that if it's a stringified object,
     * the object is returned. Otherwise, return the content as-is.
     *
     * @param {*} content
     * @returns {(Object|*)} - Object if the content is a stringified object, otherwise the passed content
     */
    function attemptParseJson(content) {
        let parsedContent;

        try {
            parsedContent = JSON.parse(content);
        } catch (e) {
            parsedContent = content;
        }

        return parsedContent;
    }

    /**
     * Returns the configured mock response. If a dynamic response modification function exists, then modify the
     * response before returning it and save it to the urlRequestMap.
     *
     * @param {string} url
     * @param {*} requestPayload
     * @returns {*} - Configured response after the dynamic modification function has been run (if it exists)
     */
    function getResponseAndDynamicallyUpdate(url, requestPayload) {
        const mockResponseConfig = urlResponseMap[url];

        if (mockResponseConfig.dynamicResponseModFn && typeof mockResponseConfig.dynamicResponseModFn === 'function') {
            const newResponse = deepCopyObject(
                mockResponseConfig.dynamicResponseModFn(attemptParseJson(requestPayload), mockResponseConfig.response) || null
            );

            mockResponseConfig.response = newResponse;
        }

        return mockResponseConfig.response;
    }

    /**
     * Composes the passed function with a timeout delay if it exists
     *
     * @param {number} delay - Milliseconds delay
     * @param {function} func - Function to wrap
     * @returns {function} - Original function if no delay or same function to be called after a delay
     */
    function withOptionalDelay(delay, func) {
        if (delay) {
            return (...args) => {
                setTimeout(() => {
                    func(...args);
                }, delay);
            };
        }

        return func;
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

            function mockXhrRequest(requestPayload) {
                const mockedResponse = getResponseAndDynamicallyUpdate(xhr.url, requestPayload);
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
                xhr.originalOpen(method, url, ...args);
            };

            xhr.originalSend = xhr.send;
            xhr.send = function(requestPayload) {
                if (urlIsMocked(xhr.url)) {
                    mockXhrRequest(requestPayload);
                    const resolveAfterDelay = withOptionalDelay(urlResponseMap[xhr.url].delay, xhr.onreadystatechange);
                    resolveAfterDelay();
                } else {
                    xhr.originalSend(requestPayload);
                }
            };

            return xhr;
        }
    }

    function overwriteFetch() {
        originalFetch = fetch;

        fetch = function(url, options) {
            if (urlIsMocked(url)) {
                const requestPayload = (options && options.hasOwnProperty('body') && options.body)
                    ? attemptParseJson(options.body)
                    : undefined;
                const responseBody = getResponseAndDynamicallyUpdate(url, requestPayload);
                const response = {
                    json: () => Promise.resolve(responseBody),
                    text: () => Promise.resolve(castToString(responseBody))
                };

                return new Promise(res => {
                    const resolveAfterDelay = withOptionalDelay(urlResponseMap[url].delay, res);
                    resolveAfterDelay(response);
                });
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
        configureDynamicResponses,
        setMockUrlResponse,
        setDynamicMockUrlResponse,
        getResponse,
        deleteMockUrlResponse,
        clearAllMocks,
        OriginalXHR,
        originalFetch
    };
})();

export default MockRequests;
