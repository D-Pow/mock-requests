import MockRequests from '../src';

const mockUrlPathname = 'https://example.com/someApi';
const mockUrl1 = mockUrlPathname + '?q1=val1&q2=val2#someHash';
const mockUrl2 = mockUrlPathname + '?someQuery=someValue';
const mockUrl3 = mockUrlPathname + '#differentHash';

function dynamicModFn(request, response, queryParamMap) {
    response = {
        queryVals: [],
        payload: null,
        hashVal: null
    };

    Object.keys(queryParamMap).forEach(query => response.queryVals.push(queryParamMap[query]));

    if (queryParamMap.hash) {
        response.hashVal = queryParamMap.hash;
    }

    if (request) {
        response.payload = request;
    }

    return response;
}

const dynamicConfigWithQueryParsing = {
    [mockUrlPathname]: {
        dynamicResponseModFn: dynamicModFn,
        usePathnameForAllQueries: true
    }
};
const dynamicConfigWithoutQueryParsing = {
    [mockUrl1]: {
        response: 'hello'
    },
    [mockUrl2]: {
        response: 'world'
    },
    [mockUrl3]: {
        response: 'only hash'
    }
};

describe('Dynamic modifications with query parameters', () => {
    beforeEach(() => {
        MockRequests.clearAllMocks();
    });

    it('should treat URLs with the same pathname identically if usePathnameForAllQueries is true', async () => {
        const testSamePathnameIsIdentical = async () => {
            const queriesAndHash = await fetch(mockUrl1).then(res => res.json());
            const onlyQueries = await fetch(mockUrl2).then(res => res.json());

            expect(queriesAndHash.queryVals.length).toEqual(3); // 2 queries and one hash
            expect(queriesAndHash.hashVal).toEqual('someHash');
            expect(onlyQueries.queryVals.length).toEqual(1);
            expect(onlyQueries.hashVal).toBe(null);
        };

        // Test with both configure() and setResponse()
        MockRequests.configureDynamicResponses(dynamicConfigWithQueryParsing);
        await testSamePathnameIsIdentical();
        MockRequests.deleteMockUrlResponse(mockUrlPathname);
        MockRequests.setDynamicMockUrlResponse(mockUrl1, dynamicConfigWithQueryParsing[mockUrlPathname]);
        MockRequests.setDynamicMockUrlResponse(mockUrl2, dynamicConfigWithQueryParsing[mockUrlPathname]);
        await testSamePathnameIsIdentical();
    });

    it('should treat URLs with the same pathname separately if usePathnameForAllQueries is false', async () => {
        const testSamePathnameIsSeparate = async () => {
            const mock1Response = await fetch(mockUrl1).then(res => res.json());
            const mock2Response = await fetch(mockUrl2).then(res => res.json());
            const mock3Response = await fetch(mockUrl3).then(res => res.json());

            expect(mock1Response).not.toEqual(mock2Response);
            expect(mock1Response).toEqual(dynamicConfigWithoutQueryParsing[mockUrl1].response);
            expect(mock2Response).toEqual(dynamicConfigWithoutQueryParsing[mockUrl2].response);
            expect(mock3Response).toEqual(dynamicConfigWithoutQueryParsing[mockUrl3].response);
        };

        // Test with both configure() and setResponse()
        MockRequests.configureDynamicResponses(dynamicConfigWithoutQueryParsing);
        await testSamePathnameIsSeparate();
        MockRequests.deleteMockUrlResponse(mockUrl1);
        MockRequests.deleteMockUrlResponse(mockUrl2);
        MockRequests.deleteMockUrlResponse(mockUrl3);
        MockRequests.setDynamicMockUrlResponse(mockUrl1, dynamicConfigWithoutQueryParsing[mockUrl1]);
        MockRequests.setDynamicMockUrlResponse(mockUrl2, dynamicConfigWithoutQueryParsing[mockUrl2]);
        MockRequests.setDynamicMockUrlResponse(mockUrl3, dynamicConfigWithoutQueryParsing[mockUrl3]);
        await testSamePathnameIsSeparate();
    });

    it('should pass the queryParamMap regardless of the value of usePathnameForAllQueries', async () => {
        MockRequests.setDynamicMockUrlResponse(mockUrl1, {
            dynamicResponseModFn: (request, response, queryParamMap) => {
                expect(Object.keys(queryParamMap).length).toEqual(3);
            }
        });

        await fetch(mockUrl1);
    });

    it('should work for base pathname even if no parameters are passed', async () => {
        const expectedRequest = { data: 'foo' };
        const expectedResponse = { data: 'bar' };

        async function testBlankPathname(url) {
            MockRequests.clearAllMocks();
            MockRequests.setDynamicMockUrlResponse(url, {
                usePathnameForAllQueries: true,
                dynamicResponseModFn: (request, response, queryParamMap) => {
                    return {
                        request,
                        response: expectedResponse,
                        queryParamMap
                    };
                }
            });

            const { request, response, queryParamMap } = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(expectedRequest)
            }).then(res => res.json());

            expect(request.data).toEqual(expectedRequest.data);
            expect(response.data).toBe(expectedResponse.data);
            expect(Object.keys(queryParamMap).length).toEqual(0);
        }

        await testBlankPathname(mockUrlPathname);
        await testBlankPathname(mockUrlPathname + '?');
        await testBlankPathname(mockUrlPathname + '#');
        await testBlankPathname(mockUrlPathname + '?#');
    });
});
