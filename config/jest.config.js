import '@babel/polyfill';

global.XMLHttpRequest = jest.fn(() => {
    return {
        open: () => {},
        send: () => {},
        dispatchEvent: (...args) => global.dispatchEvent(...args),
    };
});
global.fetch = jest.fn(() => Promise.resolve({
    json: () => ({ realFetchResponse: 'realFetchResponse' }),
    text: () => 'realFetchResponse'
}));
global.Headers = jest.fn();
global.Request = jest.fn((url, options) => ({
    url,
    text: () => Promise.resolve(options ? options.body : '')
}));



global.dispatchEvent = jest.fn(event => event);
