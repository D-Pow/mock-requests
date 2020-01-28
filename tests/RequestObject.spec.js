import MockRequests from '../src/MockRequests';

const mockUrl = 'https://example.com';
const mockConfig = {
    [mockUrl]: { data: 'myData' }
};
const dynamicConfig = {
    [mockUrl]: {
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

describe('Using fetch with `new Request()` object', () => {
    beforeEach(() => {
        MockRequests.clearAllMocks();
    });

    it('should parse Request objects if used in fetch', async () => {
        MockRequests.configure(mockConfig);

        const expected = mockConfig[mockUrl];

        const requestWithoutBody = new Request(mockUrl);
        const responseWithoutBody = await fetch(requestWithoutBody).then(res => res.json());

        const requestWithBody = new Request(mockUrl, {
            method: 'POST',
            body: expected
        });
        const responseWithBody = await fetch(requestWithBody).then(res => res.json());

        expect(typeof responseWithoutBody).toEqual(typeof {});
        expect(responseWithoutBody.data).toEqual(expected.data);
        expect(typeof responseWithBody).toEqual(typeof {});
        expect(responseWithBody.data).toEqual(expected.data);
    });

    it('should be able to dynamically update responses', async () => {
        const originalConfig = JSON.parse(JSON.stringify(dynamicConfig[mockUrl].response));

        MockRequests.configureDynamicResponses(dynamicConfig);

        const mockPayloadRound1 = {
            addLettersArray: ['f', 'g'],
            valueModification: 5
        };
        const modifiedResponseRound1 = await fetch(new Request(mockUrl, {
            body: JSON.stringify(mockPayloadRound1)
        })).then(res => res.json());
        const expectedResponseRound1 = {
            data: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            value: 12
        };

        expect(modifiedResponseRound1).toEqual(expectedResponseRound1);

        const mockPayloadRound2 = {
            addLettersArray: ['h', 'i', 'j'],
            valueModification: -10
        };
        const modifiedResponseRound2 = await fetch(new Request(mockUrl, {
            body: JSON.stringify(mockPayloadRound2)
        })).then(res => res.json());
        const expectedResponseRound2 = {
            data: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            value: 2
        };

        expect(modifiedResponseRound2).toEqual(expectedResponseRound2);
        expect(dynamicConfig[mockUrl].response).toEqual(originalConfig);
    });

    it('should be able to handle dynamic responses without a payload', async () => {
        const mockedResponse = { data: 'some val' };

        MockRequests.setDynamicMockUrlResponse(mockUrl, {
            dynamicResponseModFn: () => mockedResponse
        });

        const response = await fetch(new Request(mockUrl)).then(res => res.json());

        expect(response).toEqual(mockedResponse);
    });
});
