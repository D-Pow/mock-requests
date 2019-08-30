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
            const mockedValues = {
                readyState: 4,
                status: 200,
                statusText: 'OK',
                timeout: 0
            };
            const setValues = {
                readyState: 0,
                response: "",
                responseText: "",
                responseType: "",
                responseURL: "",
                responseXML: null,
                status: 0,
                statusText: "",
                timeout: 0
            };
            xhr.getField = field => {
                return xhr.isMocked ? mockedValues[field] : setValues[field];
            };

            function mockXhrRequest() {
                Object.defineProperties(xhr, {
                    readyState: {
                        get: () => xhr.getField('readyState'),
                        set: function(val) {
                            setValues.readyState = val;
                        }
                    },
                    status: {
                        get: () => xhr.getField('status'),
                        set: function(val) {
                            setValues.status = val;
                        }
                    },
                    statusText: {
                        get: () => xhr.getField('statusText'),
                        set: function(val) {
                            setValues.statusText = val;
                        }
                    },
                    responseUrl: {
                        get: () => xhr.isMocked ? xhr.url : setValues.responseUrl,
                        set: function(val) {
                            setValues.responseUrl = val;
                        }
                    },
                    response: {
                        get: () => {
                            return xhr.isMocked ? urlResponseMap[xhr.url] : setValues.response;
                        },
                        set: function(val) {
                            setValues.response = val;
                        }
                    },
                    responseText: {
                        get: () => {
                            return xhr.isMocked ? JSON.stringify(urlResponseMap[xhr.url]) : setValues.responseText;
                        },
                        set: function(val) {
                            setValues.responseText = val;
                        }
                    },
                    timeout: {
                        get: () => xhr.getField('timeout'),
                        set: function(val) {
                            setValues.timeout = val;
                        }
                    }
                });
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

    if (XMLHttpRequest) {
        overwriteXmlHttpRequestObject();
    }

    return {
        configure,
        setMockUrlResponse,
        getResponse
    };
})();

export default RequestMock;
