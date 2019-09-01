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
