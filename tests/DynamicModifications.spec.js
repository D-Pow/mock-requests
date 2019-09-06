import RequestMock from '../src/RequestMock';

const mockUrl1 = 'https://example.com/someApi/1';
const mockUrl2 = 'https://example.com/someApi/2';

const dynamicConfig1 = {
    [mockUrl1]: {
        response: {
            data: ['a', 'b', 'c', 'd', 'e'],
            value: 7
        },
        dynamicResponseModFn: (request, response) => {
            response.data = response.data.concat(request.addLettersArray);
            response.value += request.valueModification;

            return response;
        }
    }
};
const dynamicConfig2 = {
    [mockUrl2]: {
        response: {
            aggregateObjects: [
                { id: 1, value: 'Some value' }
            ]
        },
        dynamicResponseModFn: (request, response) => {
            if (request.removeId) {
                const indexToRemove = response.aggregateObjects.findIndex(object => object.id === request.removeId);
                response.aggregateObjects.splice(indexToRemove, 1);
            }

            if (request.addObject) {
                response.aggregateObjects.push(request.addObject);
            }

            return response;
        }
    }
};

describe('Dynamic response modifications', () => {
    beforeEach(() => {
        RequestMock.clearAllMocks();
    });

    it('should configure URLs to mock in constructor and setter function', () => {
        expect(RequestMock.getResponse(mockUrl1)).toBe(undefined);

        RequestMock.configureDynamicResponses(dynamicConfig1);

        expect(RequestMock.getResponse(mockUrl1)).toEqual(dynamicConfig1[mockUrl1].response);
        expect(RequestMock.getResponse(mockUrl2)).toBe(undefined);

        RequestMock.deleteMockUrlResponse(mockUrl1);

        expect(RequestMock.getResponse(mockUrl1)).toBe(undefined);
        expect(RequestMock.getResponse(mockUrl2)).toBe(undefined);

        RequestMock.configureDynamicResponses(dynamicConfig1);
        RequestMock.setDynamicMockUrlResponse(mockUrl2, dynamicConfig2[mockUrl2]);

        expect(RequestMock.getResponse(mockUrl1)).toEqual(dynamicConfig1[mockUrl1].response);
        expect(RequestMock.getResponse(mockUrl2)).toEqual(dynamicConfig2[mockUrl2].response);
    });

    it('should be able to handle null response/dynamicResponseModFn entries', () => {
        RequestMock.configureDynamicResponses({
            [mockUrl1]: {}
        });
    });

    it('should have the ability to maintain previous configurations', () => {
        expect(RequestMock.getResponse(mockUrl1)).toBe(undefined);
        expect(RequestMock.getResponse(mockUrl2)).toBe(undefined);

        RequestMock.configureDynamicResponses(dynamicConfig1);
        RequestMock.configureDynamicResponses(dynamicConfig2, false);

        expect(RequestMock.getResponse(mockUrl1)).toEqual(dynamicConfig1[mockUrl1].response);
        expect(RequestMock.getResponse(mockUrl2)).toEqual(dynamicConfig2[mockUrl2].response);
    });

    it('should dynamically update the response object of fetch for URLs mocked without changing original config', async () => {
        const originalConfig = JSON.parse(JSON.stringify(dynamicConfig1[mockUrl1].response));

        RequestMock.configureDynamicResponses(dynamicConfig1);

        const mockPayloadRound1 = {
            addLettersArray: ['f', 'g'],
            valueModification: 5
        };
        const modifiedResponseRound1 = await fetch(mockUrl1, {
            body: JSON.stringify(mockPayloadRound1)
        }).then(res => res.json());
        const expectedResponseRound1 = {
            data: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            value: 12
        };
        expect(modifiedResponseRound1).toEqual(expectedResponseRound1);

        const mockPayloadRound2 = {
            addLettersArray: ['h', 'i', 'j'],
            valueModification: -10
        };
        const modifiedResponseRound2 = await fetch(mockUrl1, {
            body: JSON.stringify(mockPayloadRound2)
        }).then(res => res.json());
        const expectedResponseRound2 = {
            data: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            value: 2
        };
        expect(modifiedResponseRound2).toEqual(expectedResponseRound2);

        expect(dynamicConfig1[mockUrl1].response).toEqual(originalConfig);
    });

    it('should dynamically update the response object of XMLHttpRequest for URLs mocked without changing original config', () => {
        const originalConfig = JSON.parse(JSON.stringify(dynamicConfig2[mockUrl2].response));

        const testDynamicXhrResponse = (payload, expectedResult) => {
            const mockXhr = new XMLHttpRequest();
            mockXhr.open('POST', mockUrl2);
            mockXhr.onreadystatechange = () => {
                expect(mockXhr.response).toEqual(expectedResult);
            };
            mockXhr.send(payload);
        };

        RequestMock.configureDynamicResponses(dynamicConfig2);

        const mockPayload1 = {
            addObject: {
                id: 2,
                someData: 'my new data'
            }
        };
        const expectedResponse1 = {
            aggregateObjects: [
                { id: 1, value: 'Some value' },
                mockPayload1.addObject
            ]
        };

        const mockPayload2 = {
            removeId: 1,
            addObject: {
                id: 3,
                differentField: {
                    data: 'some other data'
                }
            }
        };
        const expectedResponse2 = {
            aggregateObjects: [
                mockPayload1.addObject,
                mockPayload2.addObject
            ]
        };

        testDynamicXhrResponse(mockPayload1, expectedResponse1);
        testDynamicXhrResponse(mockPayload2, expectedResponse2);

        expect(dynamicConfig2[mockUrl2].response).toEqual(originalConfig);
    });

    it('should parse request objects if they are JSON', async () => {
        RequestMock.configureDynamicResponses({
            [mockUrl1]: {
                dynamicResponseModFn: (request) => {
                    expect(typeof request).toEqual(typeof {});
                }
            },
            [mockUrl2]: {
                dynamicResponseModFn: (request) => {
                    expect(typeof request).toEqual(typeof '');
                }
            }
        });

        await fetch(mockUrl1, {
            body: JSON.stringify({})
        });
        await fetch(mockUrl2, {
            body: 'some other payload'
        });
    });

    it('should have the ability to remove dynamic response-changing functions', async () => {
        RequestMock.configureDynamicResponses(dynamicConfig1);

        const mockPayloadRound1 = {
            addLettersArray: ['f', 'g'],
            valueModification: 5
        };
        const modifiedResponseRound1 = await fetch(mockUrl1, {
            body: JSON.stringify(mockPayloadRound1)
        }).then(res => res.json());
        const expectedResponseRound1 = {
            data: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            value: 12
        };
        expect(modifiedResponseRound1).toEqual(expectedResponseRound1);

        const nowStaticResponse = 'now a static response';
        RequestMock.setDynamicMockUrlResponse(mockUrl1, { response: nowStaticResponse });
        const modifiedResponseRound2 = await fetch(mockUrl1, {
            body: 'some other type of payload'
        }).then(res => res.json());
        expect(modifiedResponseRound2).toEqual(nowStaticResponse);

        RequestMock.setDynamicMockUrlResponse(mockUrl1);
        const modifiedResponseRound3 = await fetch(mockUrl1, {
            body: 'some other type of payload'
        }).then(res => res.json());
        expect(modifiedResponseRound3).toEqual(nowStaticResponse);
    });
});
