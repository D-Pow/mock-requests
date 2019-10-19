/**
 * MockRequests will mock both XMLHttpRequest and fetch such that
 * any requested URL will return the specified mock object instead
 * of actually making an async request. URLs not configured will
 * be unaffected and still trigger an async request as normal.
 *
 * @module mock-requests
 */

/**
 * @typedef {Object} MockRequestsImport
 * @property {function} configure - {@link module:mock-requests~MockRequests.configure}
 * @property {function} configureDynamicResponses - {@link module:mock-requests~MockRequests.configureDynamicResponses}
 * @property {function} setMockUrlResponse - {@link module:mock-requests~MockRequests.setMockUrlResponse}
 * @property {function} setDynamicMockUrlResponse - {@link module:mock-requests~MockRequests.setDynamicMockUrlResponse}
 * @property {function} getResponse - {@link module:mock-requests~MockRequests.getResponse}
 * @property {function} deleteMockUrlResponse - {@link module:mock-requests~MockRequests.deleteMockUrlResponse}
 * @property {function} clearAllMocks - {@link module:mock-requests~MockRequests.clearAllMocks}
 * @property {function} mapStaticMockConfigToDynamic - {@link module:mock-requests~MockRequests.mapStaticMockConfigToDynamic}
 * @property {function} OriginalXHR - {@link module:mock-requests~MockRequests.OriginalXHR}
 * @property {function} originalFetch - {@link module:mock-requests~MockRequests.originalFetch}
 */

/**
 * @namespace MockRequests
 */

const MockRequests = (/** @returns {MockRequestsImport} */ function MockRequestsFactory() {
    /**
     * @typedef {function} DynamicResponseModFn
     * @param {*} request - Payload passed to the async function
     * @param {*} response - Previous response object to be modified
     * @returns {*} modifiedResponse - Updated response to be saved in the mock response map
     * @memberOf module:mock-requests~MockRequests
     */
    /**
     * @typedef {Object} MockResponseConfig
     * @property {Object} response - Mock response to be returned
     * @property {DynamicResponseModFn} dynamicResponseModFn - Function to dynamically change the response object based on previous request/response
     * @property {number} delay - Optional network mock resolution time
     * @property {boolean} parseQueryParams - Optional flag to treat all URLs with the same pathname as one URL
     * @memberOf module:mock-requests~MockRequests
     */

    /**
     * Key (URL string) - Value (mock response) pairs for network mocks
     *
     * @type {Object.<string, MockResponseConfig>}
     */
    let urlResponseMap = {};

    let OriginalXHR;
    let originalFetch;

    /**
     * Initialize the mock with response objects.
     *
     * @param  {Object.<string, Object>} apiUrlResponseConfig - Config object containing URL strings as keys and respective mock response objects as values
     * @param {boolean} [overwritePreviousConfig=true] - If the map from a previous configure call should be maintained (true) or not (false)
     * @memberOf module:mock-requests~MockRequests
     */
    function configure(apiUrlResponseConfig = {}, overwritePreviousConfig = true) {
        const newUrlResponseMap = mapStaticMockConfigToDynamic(apiUrlResponseConfig);

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
     * @memberOf module:mock-requests~MockRequests
     */
    function configureDynamicResponses(dynamicApiUrlResponseConfig = {}, overwritePreviousConfig = true) {
        const newUrlResponseMap = Object.keys(dynamicApiUrlResponseConfig).reduce((mockResponses, key) => {
            mockResponses[key] = {
                response: deepCopyObject(dynamicApiUrlResponseConfig[key].response),
                dynamicResponseModFn: dynamicApiUrlResponseConfig[key].dynamicResponseModFn,
                delay: dynamicApiUrlResponseConfig[key].delay,
                parseQueryParams: Boolean(dynamicApiUrlResponseConfig[key].parseQueryParams)
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
     * @memberOf module:mock-requests~MockRequests
     */
    function setMockUrlResponse(url, response = null) {
        const mockResponseConfig = urlResponseMap[url] ? urlResponseMap[url] : mapStaticMockConfigToDynamic({});

        mockResponseConfig.response = deepCopyObject(response);
        urlResponseMap[url] = mockResponseConfig;
    }

    /**
     * Mock any network requests to the given URL using the given responseObject
     * and dynamic response modification function
     *
     * @param {string} url - URL to mock
     * @param {MockResponseConfig} mockResponseConfig - Config object with the fields desired to be configured
     * @param {Object|string|number|boolean} mockResponseConfig.response - Mock response to be resolved
     * @param {function} mockResponseConfig.dynamicResponseModFn - Function to update response object from previous request/response values
     * @param {number} mockResponseConfig.delay - Optional resolution delay time
     * @param {boolean} mockResponseConfig.parseQueryParams - Optional flag to treat all URLs with the same pathname as one URL
     * @memberOf module:mock-requests~MockRequests
     */
    function setDynamicMockUrlResponse(url, { response, dynamicResponseModFn, delay, parseQueryParams } = {}) {
        const mockResponseConfig = getConfig(url) || mapStaticMockConfigToDynamic({});

        if (response) {
            mockResponseConfig.response = deepCopyObject(response);
        }

        if (dynamicResponseModFn && typeof dynamicResponseModFn === 'function') {
            mockResponseConfig.dynamicResponseModFn = dynamicResponseModFn;
        } else {
            mockResponseConfig.dynamicResponseModFn = null;
        }

        if (delay) {
            mockResponseConfig.delay = delay;
        }

        mockResponseConfig.parseQueryParams = Boolean(parseQueryParams);

        if (mockResponseConfig.parseQueryParams) {
            const { pathname } = getPathnameAndQueryParams(url);
            urlResponseMap[pathname] = mockResponseConfig;
        } else {
            urlResponseMap[url] = mockResponseConfig;
        }
    }

    /**
     * Get the mock response object associated with the passed URL
     *
     * @param {string} url
     * @returns {*} - Configured response object
     * @memberOf module:mock-requests~MockRequests
     */
    function getResponse(url) {
        const config = getConfig(url);

        if (!config) {
            return undefined;
        }

        return config.response;
    }

    /**
     * Gets the config object for a specified URL or its pathname if the URL itself isn't mocked
     *
     * @param {string} url
     * @returns {MockResponseConfig|undefined}
     */
    function getConfig(url) {
        const isMocked = urlIsMocked(url);

        if (!isMocked) {
            return undefined;
        }

        const { pathname } = getPathnameAndQueryParams(url);
        const config = urlResponseMap[url] || urlResponseMap[pathname];

        return config;
    }

    /**
     * Deletes the URL and respective mock object
     *
     * @param url
     * @returns {boolean}
     * @memberOf module:mock-requests~MockRequests
     */
    function deleteMockUrlResponse(url) {
        const config = getConfig(url);

        if (config.parseQueryParams) {
            const { pathname } = getPathnameAndQueryParams(url);
            return delete urlResponseMap[pathname];
        }

        return delete urlResponseMap[url];
    }

    /**
     * Deletes all entries in the MockRequests configuration
     *
     * @memberOf module:mock-requests~MockRequests
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
    function deepCopyObject(obj = null) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Reformats a static URL-response config object to match the dynamic MockResponseConfig object
     *
     * @param {Object.<string, Object>} staticConfig - URL-staticResponse map
     * @returns {Object<string, MockResponseConfig>} - URL-MockResponseConfig object with any dynamic configurations applied to all URLs
     * @memberOf module:mock-requests~MockRequests
     */
    function mapStaticMockConfigToDynamic(staticConfig) {
        return Object.keys(staticConfig).reduce((dynamicMockConfig, staticUrl) => {
            const staticResponse = deepCopyObject(staticConfig[staticUrl]);

            dynamicMockConfig[staticUrl] = {
                response: staticResponse,
                dynamicResponseModFn: null,
                delay: null,
                parseQueryParams: false
            };

            return dynamicMockConfig;
        }, {});
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
     * Parses a URL for query parameters/hash entry and extracts the pathname/query parameter map respectively.
     *
     * @param {string} url - URL to parse for query parameters
     * @returns {{hasQueryParams: boolean, queryParamMap: Object, pathname: string}} - Pathname, query parameter map, and if query params/hash exist
     */
    function getPathnameAndQueryParams(url) {
        const queryIndex = url.indexOf('?');
        const hasQueryParams = queryIndex >= 0;
        const hashIndex = url.indexOf('#');
        const hasHash = hashIndex >= 0;
        const pathname = hasQueryParams ?
            url.substring(0, queryIndex)
            : hasHash ?
                url.substring(0, hashIndex)
                : url;
        const queryString = hasQueryParams ?
            hasHash ?
                url.substring(queryIndex + 1, hashIndex)
                : url.substring(queryIndex + 1)
            : '';
        const hashString = hasHash ? url.substring(hashIndex + 1) : '';
        const queryParamMap = queryString.length === 0 ? {} : queryString.split('&').reduce((queryParamObj, query) => {
            const unparsedKeyVal = query.split('=');
            const key = decodeURIComponent(unparsedKeyVal[0]);
            const val = decodeURIComponent(unparsedKeyVal[1]);

            queryParamObj[key] = val;

            return queryParamObj;
        }, {});

        if (hashString.length > 0) {
            queryParamMap.hash = decodeURIComponent(hashString);
        }

        return {
            pathname,
            queryParamMap,
            hasQueryParams: hasQueryParams || hasHash
        };
    }

    function urlIsMocked(url) {
        const urlIsMocked = urlResponseMap.hasOwnProperty(url);
        const { pathname, hasQueryParams } = getPathnameAndQueryParams(url);
        const pathnameIsMocked = urlResponseMap.hasOwnProperty(pathname);

        return urlIsMocked || (hasQueryParams && pathnameIsMocked && urlResponseMap[pathname].parseQueryParams);
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
        const mockResponseConfig = getConfig(url);

        if (mockResponseConfig.dynamicResponseModFn && typeof mockResponseConfig.dynamicResponseModFn === 'function') {
            const newResponse = deepCopyObject(
                mockResponseConfig.dynamicResponseModFn(
                    attemptParseJson(requestPayload),
                    mockResponseConfig.response
                )
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
                    const resolveAfterDelay = withOptionalDelay(getConfig(xhr.url).delay, xhr.onreadystatechange);
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
                    const resolveAfterDelay = withOptionalDelay(getConfig(url).delay, res);
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

    /**
     * Original XMLHttpRequest class, as defined in the browser
     *
     * @class OriginalXHR
     * @augments XMLHttpRequest
     * @memberOf module:mock-requests~MockRequests
     */
    /**
     * Original fetch function, as defined in the browser
     *
     * @function originalFetch
     * @memberOf module:mock-requests~MockRequests
     */

    return {
        configure,
        configureDynamicResponses,
        setMockUrlResponse,
        setDynamicMockUrlResponse,
        getResponse,
        deleteMockUrlResponse,
        clearAllMocks,
        mapStaticMockConfigToDynamic,
        OriginalXHR,
        originalFetch
    };
})();

export default MockRequests;
