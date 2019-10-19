import MockRequests from '../src/MockRequests';

const mockUrlPathname = 'https://example.com/someApi';
const mockUrl1 = mockUrlPathname + '?q1=val1&q2=val2#someHash';
const mockUrl2 = mockUrlPathname + '?someQuery=someValue';

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
        parseQueryParams: true
    }
};
const dynamicConfigWithoutQueryParsing = {
    [mockUrl1]: {
        response: 'hello'
    },
    [mockUrl2]: {
        response: 'world'
    }
};

describe('Dynamic modifications with query parameters', () => {
    beforeEach(() => {
        MockRequests.clearAllMocks();
    });

    it('should treat URLs with the same pathname identically if parseQueryParams is true', async () => {
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

    it('should treat URLs with the same pathname separately if parseQueryParams is false', async () => {
        const testSamePathnameIsSeparate = async () => {
            const mock1Response = await fetch(mockUrl1).then(res => res.json());
            const mock2Response = await fetch(mockUrl2).then(res => res.json());

            expect(mock1Response).not.toEqual(mock2Response);
            expect(mock1Response).toEqual(dynamicConfigWithoutQueryParsing[mockUrl1].response);
            expect(mock2Response).toEqual(dynamicConfigWithoutQueryParsing[mockUrl2].response);
        };

        // Test with both configure() and setResponse()
        MockRequests.configureDynamicResponses(dynamicConfigWithoutQueryParsing);
        await testSamePathnameIsSeparate();
        MockRequests.deleteMockUrlResponse(mockUrl1);
        MockRequests.deleteMockUrlResponse(mockUrl2);
        MockRequests.setDynamicMockUrlResponse(mockUrl1, dynamicConfigWithoutQueryParsing[mockUrl1]);
        MockRequests.setDynamicMockUrlResponse(mockUrl2, dynamicConfigWithoutQueryParsing[mockUrl2]);
        await testSamePathnameIsSeparate();
    });
});
