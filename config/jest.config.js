import '@babel/polyfill';

global.XMLHttpRequest = jest.fn(() => {
    return {
        open: () => {},
        send: () => {}
    };
});
global.fetch = jest.fn(() => Promise.resolve({
    json: () => ({ realFetchResponse: 'realFetchResponse' }),
    text: () => 'realFetchResponse'
}));
global.Headers = jest.fn();
global.Request = jest.fn((url, options) => ({
    url,
    text: () => Promise.resolve(options.body)
}));
