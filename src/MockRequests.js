/** @typedef {import('./types').JsonPrimitive} JsonPrimitive */
/** @typedef {import('./types').DynamicResponseModFn} DynamicResponseModFn */
/** @typedef {import('./types').MockResponseConfig} MockResponseConfig */

let activateLogs = false

function log(...args) {
    activateLogs
        ? console.log(...args)
        : () => {};
}

// if (!activateLogs) {
//     log = () => {};
// }

/**
 * MockRequests will mock both `XMLHttpRequest` and `fetch` such that
 * one single configure call, and the entire app is provided with mocks.
 *
 * URLs not configured will be unaffected and still trigger an
 * async request as normal.
 *
 * @namespace MockRequests
 */
const MockRequests = (function MockRequestsFactory() {
    /**
     * @name {@link JsonPrimitive}
     * @kind typedef
     * @memberOf MockRequests
     */
    /**
     * @name {@link DynamicResponseModFn}
     * @kind typedef
     * @memberOf MockRequests
     */
    /**
     * @name {@link MockResponseConfig}
     * @kind typedef
     * @memberOf MockRequests
     */

    /**
     * Key (URL string) - Value ({@link MockResponseConfig}) pairs for network mocks
     *
     * @type {Object<string, MockResponseConfig>}
     */
    let urlResponseMap = {};

    /**
     * Original XMLHttpRequest class, as defined in the global environment.
     *
     * @type {(XMLHttpRequest|undefined)}
     * @memberOf MockRequests
     */
    let OriginalXHR;

    /**
     * Original fetch function, as defined in the global environment.
     *
     * @type {(function|undefined)}
     * @memberOf MockRequests
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
     * @memberOf MockRequests
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
     * @memberOf MockRequests
     */
    function configureDynamicResponses(dynamicApiUrlResponseConfig = {}, overwritePreviousConfig = true) {
        const newUrlResponseMap = Object.keys(dynamicApiUrlResponseConfig).reduce((mockResponses, url) => {
            const config = createConfigObj(dynamicApiUrlResponseConfig[url]);
            const { fullUrl, pathname } = getPathnameAndQueryParams(url);

            if (config.usePathnameForAllQueries) {
                mockResponses[pathname] = config;
            } else {
                mockResponses[fullUrl] = config;
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
     * @memberOf MockRequests
     */
    function setMockUrlResponse(url, response = null) {
        const { fullUrl } = getPathnameAndQueryParams(url);

        urlResponseMap[fullUrl] = createConfigObj({ response });
    }

    /**
     * Mock any network requests to the given URL using the given responseObject
     * and dynamic response modification function
     *
     * @param {string} url - URL to mock
     * @param {MockResponseConfig} mockResponseConfig - Config object with the fields desired to be configured
     * @memberOf MockRequests
     */
    function setDynamicMockUrlResponse(url, mockResponseConfig) {
        const config = createConfigObj(mockResponseConfig);
        const { fullUrl, pathname } = getPathnameAndQueryParams(url);

        if (config.usePathnameForAllQueries) {
            urlResponseMap[pathname] = config;
        } else {
            urlResponseMap[fullUrl] = config;
        }
    }

    /**
     * Get the mock response object associated with the passed URL
     *
     * @param {string} url - URL that was previously mocked
     * @returns {JsonPrimitive} - Configured response object
     * @memberOf MockRequests
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
     * @memberOf MockRequests
     */
    function deleteMockUrlResponse(url) {
        const config = getConfig(url);
        const { fullUrl, pathname } = getPathnameAndQueryParams(url);
        // log('DELETE:',
        //     '\nurl', url,
        //     '\nconfig', config,
        //     '\nfullUrl', fullUrl,
        //     '\npathname', pathname,
        // )

        if (config.usePathnameForAllQueries) {
            log('DELETE PATHNAME:', pathname)
            return delete urlResponseMap[pathname];
        }

        return delete urlResponseMap[fullUrl];
    }

    /**
     * Deletes all entries in the MockRequests configuration
     *
     * @memberOf MockRequests
     */
    function clearAllMocks() {
        urlResponseMap = {};
    }

    /**
     * Gets the config object for a specified URL or its pathname if the URL itself isn't mocked
     *
     * @param {string} url
     * @returns {(MockResponseConfig|null)}
     */
    function getConfig(url) {
        // TODO use urlIsMocked() first
        log(url, getMockedUrlFromUrlArg(url))
        return urlResponseMap[getMockedUrlFromUrlArg(url)];
    }

    /**
     * Create the default MockResponseConfig object structure, ensuring all fields exist and populating with default
     * values as necessary.
     *
     * @param {MockResponseConfig} mockResponseConfig - Config object with the fields desired to be configured
     * @returns {MockResponseConfig}
     */
    function createConfigObj({ response = null, dynamicResponseModFn = null, delay = 0, usePathnameForAllQueries = false } = {}) {
        // TODO lots of repeated code with the default vals in both the params and in mockResponseConfig
        // TODO make usePathnameForAllQueries default to true
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
     */
    function deepCopyObject(obj = null) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Reformats a static URL-response config object to match the dynamic MockResponseConfig object structure
     *
     * @param {Object<string, JsonPrimitive>} staticConfig - URL-staticResponse map
     * @returns {Object<string, MockResponseConfig>} - URL-MockResponseConfig object with default configuration fields
     * @memberOf MockRequests
     */
    function mapStaticConfigToDynamic(staticConfig) {
        return Object.keys(staticConfig).reduce((dynamicMockConfig, staticUrl) => {
            const { fullUrl } = getPathnameAndQueryParams(staticUrl);

            dynamicMockConfig[fullUrl] = createConfigObj({ response: staticConfig[staticUrl] });

            return dynamicMockConfig;
        }, {});
    }

    /**
     * Gets the `responseText` for XHR or `res.text()` for fetch.
     *
     * @param {JsonPrimitive} response
     */
    function castToString(response) {
        return (typeof response === typeof {}) ? JSON.stringify(response) : `${response}`;
    }

    /**
     * Parses a URL for query parameters/hash entry and extracts the pathname/query parameter map respectively.
     *
     * @param {string} url - URL to parse for query parameters
     * @returns {{hasQueryParams: boolean, queryParamMap: Object<string, string>, pathname: string, fullUrl: string}} - Pathname, query parameter map, and if query params/hash exist
     */
    // function getPathnameAndQueryParams_Both(url) {
    //     url = getFullUrl(url);
    //     const useUrlObj = false;
    //
    //     /*
    //      * TODO FromUrlObj() works, Manually() does not
    //      *  b/c FromUrl() gets the "real" pathname whereas
    //      *  Manually() gets from [0, ?], which includes the origin
    //      */
    //     if (url instanceof URL && useUrlObj) {
    //         return getPathnameAndQueryParamsFromUrlObj(url);
    //     } else {
    //         // return getPathnameAndQueryParamsManually(url.toString());
    //     }
    // }

    // function getPathnameAndQueryParamsFromUrlObj(url) {
    //     const fullUrl = url.toString();
    //     const { pathname, searchParams, hash } = url;
    //
    //     const hasHash = Boolean(hash);
    //     const queryEntries = [...searchParams.entries()];
    //     const hasQueryParams = Boolean(queryEntries.length);
    //     const queryParamMap = !hasQueryParams ? {} : queryEntries.reduce((queryParamObj, query) => {
    //         // Don't have to decode it b/c URLSearchParams does that for you
    //         const key = query[0];
    //         const val = query[1];
    //
    //         queryParamObj[key] = val;
    //         log(
    //             'key', key,
    //             'val', val
    //         )
    //
    //         return queryParamObj;
    //     }, {});
    //     log(
    //         'queryEntries', queryEntries,
    //         'queryParamMap', queryParamMap
    //     )
    //
    //     if (hasHash) {
    //         queryParamMap.hash = decodeURIComponent(hash);
    //     }
    //
    //     return {
    //         fullUrl,
    //         pathname,
    //         queryParamMap,
    //         hasQueryParams: hasQueryParams || hasHash
    //     };
    // }

    // TODO rename to getUrlSegments()
    /**
     * Parses a URL's segments and reformats query parameters/hash into an object.
     *
     * Normalizes resulting strings to never contain a trailing slash.
     *
     * @param {string} url - URL to parse for query parameters
     * @returns {{
     *      fullUrl: string,
     *      origin: string,
     *      pathname: string,
     *      queryParamString: string,
     *      queryParamMap: Object<string, string>
     * }} - Pathname, query parameter map, and if query params/hash exist
     */
    function getPathnameAndQueryParams(url = '') {
        /*
         * All regex strings use * to mark them as optional and capture
         * so they're always the same location in the resulting array.
         *
         * URL segment markers:
         * (each must ignore all those after it to avoid capturing the next segment's content)
         * Origin: none of the below, except //
         * Pathname: /
         * Query Params: ?
         * Hash: #
         */
        const originRegex = '([^/?#]*(?://)?[^/?#]*)';
        const pathnameRegex = '([^?#]*)';
        const queryParamRegex = '([^#]*)';
        const hashRegex = '(.*)';
        const urlPiecesRegex = new RegExp(`^${originRegex}${pathnameRegex}${queryParamRegex}${hashRegex}$`);
        let [
            fullUrl,
            origin,
            pathname,
            queryString,
            hashString
        ] = urlPiecesRegex.exec(url);
        const queryParamString = queryString + hashString; // store original for checking against usePathnameForAllQueries

        // normalize strings: remove trailing slashes and leading ? or #
        fullUrl = fullUrl.replace(/\/$/, '');
        origin = origin.replace(/\/$/, '');
        pathname = pathname.replace(/\/$/, '');
        queryString = queryString.substring(1);
        hashString = hashString.substring(1);

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
            fullUrl,
            origin,
            pathname,
            queryParamMap,
            queryParamString
        };
    }

    /**
     * TODO
     *
     * @param {string} url
     * @returns {(URL|string)}
     */
    // function getFullUrl(url) {
    //     let fullUrl;
    //
    //     try {
    //         fullUrl = new URL(url);
    //     } catch (urlErr) {
    //         try {
    //             fullUrl = new URL(globalScope.location.origin + url);
    //         } catch (urlWithOriginErr) {
    //             fullUrl = url;
    //         }
    //     }
    //
    //     return fullUrl;
    // }

    /**
     * TODO
     */
    function getMockedUrlFromUrlArg(url, logStuff=false) {
        const hasUrl = urlKey => urlResponseMap.hasOwnProperty(urlKey);
        const { fullUrl, origin, pathname, queryParamMap } = getPathnameAndQueryParams(url);

        if (logStuff) {
            log(
                '\nfullUrl', fullUrl,
                '\norigin', origin,
                '\npathname', pathname,
                '\nqueryParamMap', queryParamMap,
                '\nurlResponseMap', urlResponseMap
            );
        }

        // TODO is this needed?
        //  fullUrl already contains everything, except it's normalized
        // if (hasUrl(url)) {
        //     return url;
        // }

        /**
         * Checks the entire string passed in, either by the user or fetch/XHR.
         * Could be anything (/myApi, /myApi?params, https://website.com?params, etc.)
         *
         * Includes any combination of:
         * (origin)? + (pathname)? + (query)? + (hash)?
         */
        if (hasUrl(fullUrl)) {
            return fullUrl;
        }

        // TODO should I check origin here?
        //  Probably not so that proxied requests still work
        /**
         * Only checks the pathname of the passed URL.
         * Helpful for e.g. `setMock('/myApi', {}); fetch('website.com/myApi');`
         *
         * Includes (from the URL passed in):
         * pathname
         */
        if (hasUrl(pathname)) {
            return pathname;
        }

        // TODO origin? + pathname + queryParamString

        /**
         * Pretty much the same as hasUrl(fullUrl) but excludes query params/hash.
         * Helpful for e.g. `setMock('website.com/myApi', {}); fetch('website.com/myApi?a=B');`
         * The query params will be handled in urlIsMocked()
         * Note that sometimes (often times?) `origin === ''`
         *
         * Includes (from the URL passed in):
         * (origin)? + pathname
         */
        if (hasUrl(origin + pathname)) {
            return origin + pathname;
        }

        if (globalScope?.location?.origin) {
            /**
             * Same as hasUrl(fullUrl), except prepends the actual origin.
             * Helpful for `setMock('/myApi, {}); axios('/myApi', { baseUrl: 'website.com' });`
             */
            if (hasUrl(globalScope.location.origin + fullUrl)) {
                return globalScope.location.origin + fullUrl;
            }

            if (hasUrl(globalScope.location.origin + pathname)) {
                return globalScope.location.origin + pathname;
            }
        }

        return null;
    }

    // function getMockedUrlFromUrlArg_Old(url, log=false) {
    //     const urlPathnameWithParamsRegex = /(?<!\/)\/(?!\/).*/;
    //     const urlPathnameWithoutParamsRegex = /(?<!\/)\/(?!\/)[^?#]*/;
    //     const urlFullWithoutParamsRegex = /[^?#]*/;
    //     const urlOriginPathnameQueryHashRegex = /^([^\/?#]*(?:\/\/)?[^\/?#]*)([^?#]*)([^#]*)(.*)$/;
    //
    //     const hasUrl = urlKey => urlResponseMap.hasOwnProperty(urlKey) || urlResponseMap.hasOwnProperty(`${urlKey}/`);
    //     const fullUrlObj = getFullUrl(url);
    //     const fullUrl = fullUrlObj?.toString();
    //
    //     const urlPathnameWithParams = urlPathnameWithParamsRegex.exec(fullUrl || url)?.[0];
    //     const urlPathnameWithoutParam = urlPathnameWithoutParamsRegex.exec(fullUrl || url)?.[0];
    //     const urlFullWithoutParams = urlFullWithoutParamsRegex.exec(fullUrl || url)?.[0];
    //
    //     if (log) {
    //         log(
    //             '\nurl:', url,
    //             '\nurlPathnameWithParams:', urlPathnameWithParams,
    //             '\nurlPathnameWithoutParam:', urlPathnameWithoutParam,
    //             '\nurlFullWithoutParams', urlFullWithoutParams,
    //             '\nfullUrlObj:', fullUrlObj,
    //             '\nhasUrl(url)', hasUrl(url),
    //             '\nhasUrl(fullUrlObj)', fullUrlObj?.toString() && hasUrl(fullUrlObj.toString()),
    //             '\nhasUrl(fullUrlObj.pathname)', fullUrlObj?.pathname && hasUrl(fullUrlObj.pathname),
    //             '\nurlResponseMap', urlResponseMap
    //         );
    //     }
    //
    //     if (hasUrl(url)) {
    //         return url;
    //     }
    //
    //     if (hasUrl(urlPathnameWithParams)) {
    //         return urlPathnameWithParams;
    //     }
    //
    //     if (hasUrl(urlPathnameWithoutParam)) {
    //         return urlPathnameWithoutParam;
    //     }
    //
    //     if (hasUrl(urlFullWithoutParams)) {
    //         return urlFullWithoutParams;
    //     }
    //
    //     if (hasUrl(fullUrl)) {
    //         return fullUrl;
    //     }
    //
    //     if (hasUrl(fullUrlObj?.pathname)) {
    //         return fullUrlObj.pathname;
    //     }
    //
    //     return null;
    // }

    function urlIsMocked(url) {
        // First: check if any combination of `url` segments has been mocked
        const { fullUrl, queryParamString } = getPathnameAndQueryParams(url);
        log('BEFORE:', url);
        const mockedUrl = getMockedUrlFromUrlArg(url);
        log('AFTER:', mockedUrl);

        if (!mockedUrl) {
            return false;
        }

        // const urlIsMocked = urlResponseMap.hasOwnProperty(mockedUrl);
        // const { pathname, hasQueryParams } = getPathnameAndQueryParams(mockedUrl);
        // const pathnameIsMocked = urlResponseMap.hasOwnProperty(pathname);
        // const isMocked = urlIsMocked || (hasQueryParams && pathnameIsMocked && urlResponseMap[pathname].usePathnameForAllQueries);

        // Second: check if `url` is valid when compared to the `mockedUrl` config entry
        const isUsingPathnameForMocks = urlResponseMap[mockedUrl].usePathnameForAllQueries;

        if (isUsingPathnameForMocks) {
            return true;
        }

        const urlHasQueryParams = Boolean(queryParamString.length);
        const mockedUrlHasQueryParams = /[?#]/.test(mockedUrl);

        if (urlHasQueryParams || mockedUrlHasQueryParams) {
            const fullUrlOnlyHasMockedQueryParams = fullUrl.endsWith(queryParamString);

            return fullUrlOnlyHasMockedQueryParams;
        }

        return true;

        // const isMocked = queryParamString.length
        //     ? isUsingPathnameForMocks || (mockedUrlHasQueryParams) // (mockedUrl === fullUrl)
        //     : true;

        // if (!isMocked) {
        //     log('NOT MOCKED:',
        //         '\nmockedUrl:', mockedUrl,
        //         '\nqueryParamString:', queryParamString,
        //         '\nisUsingPathnameForMocks:', isUsingPathnameForMocks,
        //         '\ngetPathnameAndQueryParams', getPathnameAndQueryParams(mockedUrl),
        //         '\nurlResponseMap', urlResponseMap
        //     );
        // }
        //
        // return isMocked;
    }

    /**
     * Parse payload content from fetch/XHR such that if it's a stringified object,
     * the object is returned. Otherwise, return the content as-is.
     *
     * @param {*} content
     * @returns {(JsonPrimitive|*)} - Object if the content is a stringified object, otherwise the passed content
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
        // TODO globalScope was added due to jest not finding the XHR variable.
        //  This is likely unnecessary now that it was proven to work as a second
        //  `setupFiles` entry in the array *after* the fetch/XHR mocks were created.
        //  Consider removing it.

        // TODO add details about `setupFiles` in ReadMe.md
        OriginalXHR = globalScope.XMLHttpRequest;

        globalScope.XMLHttpRequest = function() {
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
     */
    function overwriteFetch() {
        originalFetch = globalScope.fetch.bind(globalScope);

        globalScope.fetch = function(resource, init) {
            const isUsingRequestObject = typeof resource === typeof {};
            const url = isUsingRequestObject ? resource.url : resource;

            // console.log('fetch():',
            //     '\nurl:', url,
            //     '\nurlIsMocked:', urlIsMocked(url),
            //     '\ngetPathnameAndQueryParams:', getPathnameAndQueryParams(url),
            //     '\ngetMockedUrlFromUrlArg:', getMockedUrlFromUrlArg(url, true),
            // )

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

async function testInBrowser() {
    /** @type {URLSearchParams} */
    let urlSearchParams = new URL(
        `https://developer.mozilla.org/en-US/docs/Web/API/URL?a=${
            encodeURIComponent('A !@#$%')
        }&b=B&a=X#asdf`
    ).searchParams;

    const mozillaDocsOrigin = 'https://developer.mozilla.org';
    const urlObjDocsPathname_Base = '/en-US/docs/Web/API/URL';
    const urlObjDocsPathname_Simple = urlObjDocsPathname_Base + '?a=A&b=B#asdf';
    const urlObjDocsPathname_Complex = urlObjDocsPathname_Base + '?a=A!@$%25%5E*&b=Bas@%25$df#$%25%5E';
    const mozMockResponse = { hello: 'world' };

    MockRequests.setMockUrlResponse(urlObjDocsPathname_Base, mozMockResponse);

    const configuredPath = MockRequests.getResponse(urlObjDocsPathname_Base);
    const configuredFull = MockRequests.getResponse(mozillaDocsOrigin + urlObjDocsPathname_Base);
    console.log('Path is configured:', configuredPath?.hello === 'world');
    console.log('Full is configured:', configuredFull?.hello === 'world');

    async function testBoth() {
        const fullUrlRes = await fetch(mozillaDocsOrigin + urlObjDocsPathname_Complex);
        const fullUrlJson = await fullUrlRes.json();

        const pathUrlRes = await fetch(urlObjDocsPathname_Complex);
        const pathUrlJson = await pathUrlRes.json();

        console.log(
            'fullUrlJson', fullUrlJson,
            'pathUrlJson', pathUrlJson,
        );
    }

    console.log('Before dynamic');
    await testBoth();

    MockRequests.clearAllMocks();
    MockRequests.setDynamicMockUrlResponse(urlObjDocsPathname_Base, {
        dynamicResponseModFn: (req, res, queryParamMap) => {
            console.log('Dyn:', res, queryParamMap);

            return { ...res, ...queryParamMap };
        },
        response: mozMockResponse,
        usePathnameForAllQueries: true
    });

    console.log('After dynamic');
    await testBoth();
}
// testInBrowser();

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
export {
    testInBrowser
};
