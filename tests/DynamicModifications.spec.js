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
});
