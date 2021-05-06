/**
 * MockRequests will mock both XMLHttpRequest and fetch such that
 * any requested URL will return the specified mock object instead
 * of actually making an async request.
 *
 * URLs not configured will be unaffected and still trigger an
 * async request as normal.
 *
 * @module mock-requests
 */

/**
 * @namespace MockRequests
 */

const MockRequests = (() => {
    /**
     * Valid JSON primitive types.
     *
     * @typedef {(string|number|boolean|null|JsonPrimitive[]|Object<string, JsonPrimitive>)} JsonPrimitive
     * @memberOf module:mock-requests~MockRequests
     */
    /**
     * @typedef {function} DynamicResponseModFn
     * @param {JsonPrimitive} request - Payload passed to the async function
     * @param {JsonPrimitive} response - Previous response object to be modified
     * @param {Object<string, string>} queryParamMap - Key-value map of query parameters from the request URL. Hash content will be stored in 'hash' key.
     * @returns {JsonPrimitive} modifiedResponse - Updated response to be saved in the mock response map
     * @memberOf module:mock-requests~MockRequests
     */
    /**
     * @typedef {Object} MockResponseConfig
     * @property {JsonPrimitive} [response=null] - Initial mock response to be returned/passed into dynamicResponseModFn
     * @property {DynamicResponseModFn} [dynamicResponseModFn=null] - Function to dynamically change the response object based on previous request/response
     * @property {number} [delay=0] - Optional network mock resolution time
     * @property {boolean} [usePathnameForAllQueries=false] - Optional flag to treat all URLs with the same pathname identically
     * @memberOf module:mock-requests~MockRequests
     */

    /**
     * Key (URL string) - Value ({@link MockResponseConfig}) pairs for network mocks
     *
     * @type {Object<string, MockResponseConfig>}
     * @private
     */
    let urlResponseMap = {};

    /**
     * Original XMLHttpRequest class, as defined in the browser
     *
     * @type {(XMLHttpRequest|undefined)}
     * @memberOf module:mock-requests~MockRequests
     */
    let OriginalXHR;

    /**
     * Original fetch function, as defined in the browser
     *
     * @type {(function|undefined)}
     * @memberOf module:mock-requests~MockRequests
     */
    let originalFetch;

    const globalScope = (
        typeof window !== 'undefined'
            ? window
            : typeof self !== 'undefined'
                ? self
                : global
    );

    /**
     * Initialize the mock with response objects.
     *
     * @param  {Object<string, JsonPrimitive>} apiUrlResponseConfig - Config object containing URL strings as keys and respective mock response objects as values
     * @param {boolean} [overwritePreviousConfig=true] - If the map from a previous configure call should be overwritten by this call (true) or not (false)
     * @memberOf module:mock-requests~MockRequests
     */
    function configure(apiUrlResponseConfig = {}, overwritePreviousConfig = true) {
        const newUrlResponseMap = mapStaticConfigToDynamic(apiUrlResponseConfig);

        if (overwritePreviousConfig) {
            urlResponseMap = newUrlResponseMap;
        } else {
            urlResponseMap = { ...urlResponseMap, ...newUrlResponseMap };
        }
    }

    /**
     * Initialize the mock with response objects and their dynamic update functions
     *
     * @param {Object<string, MockResponseConfig>} dynamicApiUrlResponseConfig - URL-MockResponseConfig mappings
     * @param {boolean} [overwritePreviousConfig=true] - If the map from a previous configure call should be overwritten by this call (true) or not (false)
     * @memberOf module:mock-requests~MockRequests
     */
    function configureDynamicResponses(dynamicApiUrlResponseConfig = {}, overwritePreviousConfig = true) {
        const newUrlResponseMap = Object.keys(dynamicApiUrlResponseConfig).reduce((mockResponses, url) => {
            const config = createConfigObj(dynamicApiUrlResponseConfig[url]);

            if (config.usePathnameForAllQueries) {
                const { pathname } = getPathnameAndQueryParams(url);
                mockResponses[pathname] = config;
            } else {
                mockResponses[url] = config;
            }

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
     * @param {JsonPrimitive} response - Mock response object
     * @memberOf module:mock-requests~MockRequests
     */
    function setMockUrlResponse(url, response = null) {
        urlResponseMap[url] = createConfigObj({ response });
    }

    /**
     * Mock any network requests to the given URL using the given responseObject
     * and dynamic response modification function
     *
     * @param {string} url - URL to mock
     * @param {MockResponseConfig} mockResponseConfig - Config object with the fields desired to be configured
     * @memberOf module:mock-requests~MockRequests
     */
    function setDynamicMockUrlResponse(url, mockResponseConfig) {
        const config = createConfigObj(mockResponseConfig);

        if (config.usePathnameForAllQueries) {
            const { pathname } = getPathnameAndQueryParams(url);
            urlResponseMap[pathname] = config;
        } else {
            urlResponseMap[url] = config;
        }
    }

    /**
     * Get the mock response object associated with the passed URL
     *
     * @param {string} url - URL that was previously mocked
     * @returns {JsonPrimitive} - Configured response object
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
     * Deletes the URL and respective mock object
     *
     * @param {string} url - URL that was previously mocked
     * @returns {boolean} - Value returned from `delete Object.url`
     * @memberOf module:mock-requests~MockRequests
     */
    function deleteMockUrlResponse(url) {
        const config = getConfig(url);

        if (config.usePathnameForAllQueries) {
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
     * Gets the config object for a specified URL or its pathname if the URL itself isn't mocked
     *
     * @param {string} url
     * @returns {(MockResponseConfig|undefined)}
     * @private
     */
    function getConfig(url) {
        const isMocked = urlIsMocked(url);

        if (!isMocked) {
            return null;
        }

        const { pathname } = getPathnameAndQueryParams(url);
        const config = urlResponseMap[url] || urlResponseMap[pathname];

        return config;
    }

    /**
     * Create the default MockResponseConfig object structure, ensuring all fields exist and populating with default
     * values as necessary.
     *
     * @param {MockResponseConfig} mockResponseConfig - Config object with the fields desired to be configured
     * @returns {MockResponseConfig}
     * @private
     */
    function createConfigObj({ response = null, dynamicResponseModFn = null, delay = 0, usePathnameForAllQueries = false } = {}) {
        const mockResponseConfig = {
            response: null,
            dynamicResponseModFn: null,
            delay: 0,
            usePathnameForAllQueries: false
        };

        mockResponseConfig.response = deepCopyObject(response);

        if (dynamicResponseModFn && typeof dynamicResponseModFn === 'function') {
            mockResponseConfig.dynamicResponseModFn = dynamicResponseModFn;
        }

        if (delay) {
            mockResponseConfig.delay = delay;
        }

        mockResponseConfig.usePathnameForAllQueries = Boolean(usePathnameForAllQueries);

        return mockResponseConfig;
    }

    /**
     * Deep copies a JS object
     *
     * @param {JsonPrimitive} [obj=null]
     * @returns {JsonPrimitive}
     * @private
     */
    function deepCopyObject(obj = null) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Reformats a static URL-response config object to match the dynamic MockResponseConfig object structure
     *
     * @param {Object<string, JsonPrimitive>} staticConfig - URL-staticResponse map
     * @returns {Object<string, MockResponseConfig>} - URL-MockResponseConfig object with default configuration fields
     * @memberOf module:mock-requests~MockRequests
     */
    function mapStaticConfigToDynamic(staticConfig) {
        return Object.keys(staticConfig).reduce((dynamicMockConfig, staticUrl) => {
            dynamicMockConfig[staticUrl] = createConfigObj({ response: staticConfig[staticUrl] });

            return dynamicMockConfig;
        }, {});
    }

    /**
     * Gets the `responseText` for XHR or `res.text()` for fetch.
     *
     * @param {JsonPrimitive} response
     * @private
     */
    function castToString(response) {
        return (typeof response === typeof {}) ? JSON.stringify(response) : `${response}`;
    }

    /**
     * Parses a URL for query parameters/hash entry and extracts the pathname/query parameter map respectively.
     *
     * @param {string} url - URL to parse for query parameters
     * @returns {{hasQueryParams: boolean, queryParamMap: Object<string, string>, pathname: string}} - Pathname, query parameter map, and if query params/hash exist
     * @private
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

        return urlIsMocked || (hasQueryParams && pathnameIsMocked && urlResponseMap[pathname].usePathnameForAllQueries);
    }

    /**
     * Parse payload content from fetch/XHR such that if it's a stringified object,
     * the object is returned. Otherwise, return the content as-is.
     *
     * @param {*} content
     * @returns {(JsonPrimitive|*)} - Object if the content is a stringified object, otherwise the passed content
     * @private
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
     * @param {JsonPrimitive} requestPayload
     * @returns {JsonPrimitive} - Configured response after the dynamic modification function has been run (if it exists)
     * @private
     */
    async function getResponseAndDynamicallyUpdate(url, requestPayload) {
        const mockResponseConfig = getConfig(url);

        if (mockResponseConfig.dynamicResponseModFn && typeof mockResponseConfig.dynamicResponseModFn === 'function') {
            const { queryParamMap } = getPathnameAndQueryParams(url);
            const newResponse = deepCopyObject(
                await mockResponseConfig.dynamicResponseModFn(
                    attemptParseJson(requestPayload),
                    mockResponseConfig.response,
                    queryParamMap
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
     * @private
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
     *
     * @private
     */
    function overwriteXmlHttpRequestObject() {
        OriginalXHR = XMLHttpRequest;

        XMLHttpRequest = function() {
            const xhr = new OriginalXHR();

            async function mockXhrRequest(requestPayload) {
                const mockedResponse = await getResponseAndDynamicallyUpdate(xhr.url, requestPayload);
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
            xhr.send = async function(requestPayload) {
                if (urlIsMocked(xhr.url)) {
                    await mockXhrRequest(requestPayload);
                    const resolveAfterDelay = withOptionalDelay(getConfig(xhr.url).delay, xhr.onreadystatechange || (() => {}));
                    resolveAfterDelay();
                } else {
                    xhr.originalSend(requestPayload);
                }
            };

            return xhr;
        }
    }

    /**
     * Overwrites the fetch() function with a wrapper that mocks
     * the response value after the configured delay has passed.
     *
     * @private
     */
    function overwriteFetch() {
        originalFetch = globalScope.fetch.bind(globalScope);

        globalScope.fetch = function(resource, init) {
            const isUsingRequestObject = typeof resource === typeof {};
            const url = isUsingRequestObject ? resource.url : resource;

            if (urlIsMocked(url)) {
                return (async () => {
                    const requestPayload = isUsingRequestObject
                        ? await attemptParseJson(resource.text())
                        : (init && init.hasOwnProperty('body') && init.body)
                            ? attemptParseJson(init.body)
                            : undefined;
                    const responseBody = await getResponseAndDynamicallyUpdate(url, requestPayload);
                    const response = {
                        json: () => Promise.resolve(responseBody),
                        text: () => Promise.resolve(castToString(responseBody)),
                        status: 200,
                        statusText: '',
                        ok: true,
                        headers: new Headers({ status: '200' }),
                        redirected: false,
                        type: 'basic',
                        url
                    };

                    return await new Promise(resolve => {
                        const resolveAfterDelay = withOptionalDelay(getConfig(url).delay, resolve);
                        resolveAfterDelay(response);
                    });
                })();
            } else {
                return originalFetch(resource, init);
            }
        }
    }

    if (globalScope.XMLHttpRequest) {
        overwriteXmlHttpRequestObject();
    }

    if (globalScope.fetch) {
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
        mapStaticConfigToDynamic,
        OriginalXHR,
        originalFetch
    };
})();

export default MockRequests;
export const {
    configure,
    configureDynamicResponses,
    setMockUrlResponse,
    setDynamicMockUrlResponse,
    getResponse,
    deleteMockUrlResponse,
    clearAllMocks,
    mapStaticConfigToDynamic,
    OriginalXHR,
    originalFetch
} = MockRequests;
