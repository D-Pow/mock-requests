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

    return {
        configure,
        setMockUrlResponse,
        getResponse
    };
})();

export default RequestMock;
