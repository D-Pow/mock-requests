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
            xhr.getField = field => {
                return xhr.isMocked ? mockedValues[field] : xhr[field];
            };

            return {
                ...xhr,
                get readyState() {
                    return xhr.getField('readyState');
                },
                set readyState(val) { xhr.readyState = val; },
                get status() {
                    return xhr.getField('status');
                },
                set status(val) { xhr.status = val; },
                get statusText() {
                    return xhr.getField('statusText');
                },
                set statusText(val) { xhr.statusText = val; },
                get responseUrl() {
                    return xhr.isMocked ? xhr.url : xhr.responseUrl;
                },
                set responseUrl(val) { xhr.responseUrl = val; },
                get response() {
                    return xhr.isMocked ? urlResponseMap[xhr.url] : xhr.response;
                },
                set response(val) { xhr.response = val; },
                get responseText() {
                    return xhr.isMocked ? JSON.stringify(urlResponseMap[xhr.url]) : xhr.responseText;
                },
                set responseText(val) { xhr.responseText = val; },
                get timeout() {
                    return xhr.getField('timeout');
                },
                set timeout(val) { xhr.timeout = val; },
                open: function(method, url, ...args) {
                    xhr.url = url;

                    if (Object.keys(urlResponseMap).includes(url)) {
                        xhr.isMocked = true;
                    }

                    xhr.open(method, url, ...args);
                },
                set onreadystatechange(fn) {
                    xhr.onreadystatechange = fn;
                },
                send: function() {
                    if (xhr.isMocked) {
                        xhr.onreadystatechange();
                    } else {
                        xhr.send();
                    }
                }
            };
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
