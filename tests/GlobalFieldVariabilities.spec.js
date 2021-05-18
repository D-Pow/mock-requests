const origGlobalName = 'window';
const origGlobalObj = global[origGlobalName];
const globalNameOptions = [ 'window', 'global', 'self' ];
const OrigXHR = global.XMLHttpRequest;
const origFetch = global.fetch;

describe('Global field variabilities', () => {
    beforeEach(() => {
        jest.resetModules();
        globalNameOptions.forEach(globalName => delete global[globalName]);

        global[origGlobalName] = origGlobalObj;
        global.XMLHttpRequest = OrigXHR;
        global.fetch = origFetch;
    });

    describe('MockRequests without async functions defined in `window`', () => {
        it('should not overwrite fetch/XMLHttpRequest if it is not defined in the browser', async () => {
            global.XMLHttpRequest = undefined;
            global.fetch = undefined;
            const module = await import('../src');
            const MockRequestsWithoutAsync = module.default;

            expect(MockRequestsWithoutAsync.originalFetch).toBe(undefined);
            expect(MockRequestsWithoutAsync.OriginalXHR).toBe(undefined);
        });
    });

    describe('global name differs from "window"', () => {
        const mockUrl1 = 'https://example.com';
        const mockUrl2 = 'https://other.example/someApi';
        const mockUrl3 = '192.168.0.1';
        const staticConfig = {
            [mockUrl1]: { otherData: { someNestedField: 'myValue' }},
            [mockUrl2]: '<!DOCTYPE html><head><meta http-equiv="content-type" content="text/html;charset=utf-8"><title>301 Moved</title></head><body><h1>301 Moved</h1>The document has moved<a HREF="http://www.google.com/">here</a>.</body></html>'
        };
        const dynamicConfig = {
            [mockUrl3]: {
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

        async function testStaticResponses(MockRequests) {
            const mockFetchResponseJson = await fetch(mockUrl1).then(res => res.json());
            const mockFetchResponseText = await fetch(mockUrl2).then(res => res.text());

            expect(mockFetchResponseJson).toEqual(staticConfig[mockUrl1]);
            expect(mockFetchResponseText).toEqual(staticConfig[mockUrl2]);
        }

        async function testDynamicResponses(MockRequests) {
            const originalConfig = JSON.parse(JSON.stringify(dynamicConfig[mockUrl3].response));

            const mockPayloadRound1 = {
                addLettersArray: ['f', 'g'],
                valueModification: 5
            };
            const modifiedResponseRound1 = await fetch(mockUrl3, {
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
            const modifiedResponseRound2 = await fetch(mockUrl3, {
                body: JSON.stringify(mockPayloadRound2)
            }).then(res => res.json());
            const expectedResponseRound2 = {
                data: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
                value: 2
            };
            expect(modifiedResponseRound2).toEqual(expectedResponseRound2);

            expect(dynamicConfig[mockUrl3].response).toEqual(originalConfig);
        }

        async function testMockRequestsWorks(MockRequests) {
            MockRequests.clearAllMocks();
            MockRequests.configure(staticConfig);
            MockRequests.configureDynamicResponses(dynamicConfig, false);

            await testStaticResponses(MockRequests);
            await testDynamicResponses(MockRequests);
        }

        it('should work if global scope is "self"', async () => {
            global.self = global.window;
            Object.defineProperty(global, 'window', {
                get() {
                    return undefined;
                }
            });

            const module = await import('../src');
            const MockRequests = module.default;

            await testMockRequestsWorks(MockRequests);
        });

        it('should work if global scope is "global"', async () => {
            global.global = global.window;
            Object.defineProperty(global, 'window', {
                get() {
                    return undefined;
                }
            });

            const module = await import('../src');
            const MockRequests = module.default;

            await testMockRequestsWorks(MockRequests);
        });

        it('should work with `require()`', async () => {
            global.global = global.window;
            Object.defineProperty(global, 'window', {
                get() {
                    return undefined;
                }
            });

            const module = require('../src');
            const MockRequests = module;
            const MockRequestsDefault = module.default;

            await testMockRequestsWorks(MockRequests);
            await testMockRequestsWorks(MockRequestsDefault);
        });
    });
});
