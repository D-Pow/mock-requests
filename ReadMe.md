# RequestMock

Wraps `XMLHttpRequest` and `fetch` with a wrapper that
allows for mock responses to be returned instead of actually
making the async request. If the URL-mockResponse is configured,
it returns the specified mock response object; otherwise, the
async request is made. 
