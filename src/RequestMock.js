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

            return {
                ...xhr,
                get readyState() {
                    return 4;
                },
                set readyState(val) {},
                get status() {
                    return 200;
                },
                set status(val) {},
                get statusText() {
                    return 'OK';
                },
                set statusText(val) {},
                get responseUrl() {
                    return xhr.url;
                },
                set responseUrl(val) {},
                get response() {
                    return urlResponseMap[xhr.url];
                },
                set response(val) {},
                get responseText() {
                    return JSON.stringify(urlResponseMap[xhr.url]);
                },
                set responseText(val) {},
                get timeout() {
                    return 0;
                },
                set timeout(val) {},
                open: function(method, url, ...args) {
                    xhr.url = url; // store URL for later access
                    xhr.open(method, url, ...args);
                },
                set onreadystatechange(fn) {
                    xhr.onreadystatechange = fn;
                },
                send: function() {
                    xhr.onreadystatechange();
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
