require('isomorphic-fetch');
const MockRequests = require('mock-requests');

const realUrl = 'http://google.com';
const mockedUrl = 'https://github.com';
const mockedResponse = { data: 'someMockedValue' };

MockRequests.setMockUrlResponse(mockedUrl, mockedResponse);

(async () => {
    console.log(`Making actual network call to ${realUrl}`);
    const receivedRealResponse = await fetch(realUrl).then(res => res.text());

    console.log(`Mocking network call to ${mockedUrl}`);
    const receivedMockedResponse = await fetch(mockedUrl).then(res => res.json());

    console.log('Network call successful:', receivedRealResponse.toLowerCase().includes('<!doctype html>'));
    console.log('Mock successful:', receivedMockedResponse.data === mockedResponse.data);
})();
