import RequestMock from '../src/RequestMock';

const mockUrl1 = 'https://example.com';
const mockUrl2 = 'https://other.example/someApi';
const mockUrl3 = '192.168.0.1';
const mockUrl4 = 'http://google.com';
const notMockedUrl = 'http://not.mocked/api';

const mockConfig1 = {
    [mockUrl1]: { data: 'myData' },
    [mockUrl2]: { otherData: { someNestedField: 'myValue' }}
};
const mockConfig2 = {
    [mockUrl3]: 'My dangling string response',
    [mockUrl4]: '<!DOCTYPE html><head><meta http-equiv="content-type" content="text/html;charset=utf-8"><title>301 Moved</title></head><body><h1>301 Moved</h1>The document has moved<a HREF="http://www.google.com/">here</a>.</body></html>'
};

describe('RequestMock', () => {
    beforeEach(() => {
        RequestMock.clearAllMocks();
    });

    it('should configure URLs to mock in constructor and setter function', () => {
        expect(RequestMock.getResponse(mockUrl1)).toBe(undefined);

        RequestMock.configure();

        expect(RequestMock.getResponse(mockUrl1)).toBe(undefined);

        RequestMock.configure(mockConfig1);
        RequestMock.setMockUrlResponse(mockUrl3, mockConfig2[mockUrl3]);

        expect(RequestMock.getResponse(mockUrl1)).toEqual(mockConfig1[mockUrl1]);
        expect(RequestMock.getResponse(mockUrl3)).toEqual(mockConfig2[mockUrl3]);

        RequestMock.deleteMockUrlResponse(mockUrl1);

        expect(RequestMock.getResponse(mockUrl1)).toBe(undefined);
    });

    it('should be able to optionally maintain previous configurations when adding new ones', () => {
        expect(RequestMock.getResponse(mockUrl3)).toBe(undefined);

        RequestMock.configure(mockConfig1);

        expect(RequestMock.getResponse(mockUrl1)).toEqual(mockConfig1[mockUrl1]);
        expect(RequestMock.getResponse(mockUrl3)).toBe(undefined);

        RequestMock.configure(mockConfig2);

        expect(RequestMock.getResponse(mockUrl1)).toBe(undefined);
        expect(RequestMock.getResponse(mockUrl3)).toEqual(mockConfig2[mockUrl3]);

        RequestMock.configure(mockConfig1, false);

        expect(RequestMock.getResponse(mockUrl1)).toEqual(mockConfig1[mockUrl1]);
        expect(RequestMock.getResponse(mockUrl3)).toEqual(mockConfig2[mockUrl3]);
    });

    it('should be able to parse different types of response bodies, including JSON and HTML', () => {
        RequestMock.configure({ ...mockConfig1, ...mockConfig2 });

        expect(typeof RequestMock.getResponse(mockUrl1)).toEqual(typeof {});
        expect(typeof RequestMock.getResponse(mockUrl3)).toEqual(typeof '');
        expect(typeof RequestMock.getResponse(mockUrl4)).toEqual(typeof '');
    });

    it('should overwrite the result of fetch for URLs mocked', async () => {
        RequestMock.configure({ ...mockConfig1, ...mockConfig2 });

        const mockFetchResponseJson = await fetch(mockUrl2).then(res => res.json());
        const mockFetchResponseText = await fetch(mockUrl4).then(res => res.text());

        expect(mockFetchResponseJson).toEqual(mockConfig1[mockUrl2]);
        expect(mockFetchResponseText).toEqual(mockConfig2[mockUrl4]);
    });

    it('should overwrite the result of XMLHttpRequest for URLs mocked', async () => {
        RequestMock.configure({ ...mockConfig1, ...mockConfig2 });

        const mockXhrJson = new XMLHttpRequest();
        mockXhrJson.open('GET', mockUrl2);
        mockXhrJson.onreadystatechange = () => {
            expect(mockXhrJson.response).toEqual(mockConfig1[mockUrl2]);
        };
        mockXhrJson.send();

        const mockXhrText = new XMLHttpRequest();
        const expectedManuallyChangedStatus = 302; // HTTP code for redirect
        mockXhrText.open('GET', mockUrl4);
        mockXhrText.onreadystatechange = () => {
            mockXhrText.status = expectedManuallyChangedStatus;

            expect(mockXhrText.responseText).toEqual(mockConfig2[mockUrl4]);
            expect(mockXhrText.status).toEqual(expectedManuallyChangedStatus);
        };
        mockXhrText.send();
    });

    it('should call fetch for URLs not mocked', async () => {
        const receivedRealFetchJson = await fetch(notMockedUrl).then(res => res.json());
        const receivedRealFetchText = await fetch(notMockedUrl).then(res => res.text());

        expect(typeof receivedRealFetchJson).toEqual(typeof {});
        expect(typeof receivedRealFetchText).toEqual(typeof '');
        expect(Object.keys(receivedRealFetchJson).length).not.toBe(0);
        expect(receivedRealFetchText.length).not.toBe(0);
    });

    it('should call XMLHttpRequest for URLs not mocked', async () => {
        RequestMock.configure(mockConfig1);

        const mockXHR = new XMLHttpRequest();
        mockXHR.open('GET', notMockedUrl);
        mockXHR.onreadystatechange = jest.fn();
        mockXHR.send();
        expect(mockXHR.onreadystatechange).not.toHaveBeenCalled();
    });
});
