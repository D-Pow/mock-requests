import MockRequests, { configure, getResponse, clearAllMocks } from '../src';

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

describe('StaticResponses', () => {
    beforeEach(() => {
        MockRequests.clearAllMocks();
    });

    it('should configure URLs to mock in constructor and setter function', () => {
        expect(MockRequests.getResponse(mockUrl1)).toBe(undefined);

        MockRequests.configure(mockConfig1);
        MockRequests.setMockUrlResponse(mockUrl3, mockConfig2[mockUrl3]);

        expect(MockRequests.getResponse(mockUrl1)).toEqual(mockConfig1[mockUrl1]);
        expect(MockRequests.getResponse(mockUrl3)).toEqual(mockConfig2[mockUrl3]);

        MockRequests.deleteMockUrlResponse(mockUrl1);

        expect(MockRequests.getResponse(mockUrl1)).toBe(undefined);
    });

    it('should have fallback configs when configure/set functions are called without fields', () => {
        MockRequests.configure();
        expect(MockRequests.getResponse(mockUrl1)).toBe(undefined);

        MockRequests.configureDynamicResponses();
        expect(MockRequests.getResponse(mockUrl1)).toBe(undefined);

        MockRequests.setMockUrlResponse(mockUrl1, mockConfig1[mockUrl1]);
        expect(MockRequests.getResponse(mockUrl1)).toEqual(mockConfig1[mockUrl1]);

        MockRequests.setMockUrlResponse(mockUrl1);
        expect(MockRequests.getResponse(mockUrl1)).toBe(null);
    });

    it('should be able to optionally maintain previous configurations when adding new ones', () => {
        expect(MockRequests.getResponse(mockUrl3)).toBe(undefined);

        MockRequests.configure(mockConfig1);

        expect(MockRequests.getResponse(mockUrl1)).toEqual(mockConfig1[mockUrl1]);
        expect(MockRequests.getResponse(mockUrl3)).toBe(undefined);

        MockRequests.configure(mockConfig2);

        expect(MockRequests.getResponse(mockUrl1)).toBe(undefined);
        expect(MockRequests.getResponse(mockUrl3)).toEqual(mockConfig2[mockUrl3]);

        MockRequests.configure(mockConfig1, false);

        expect(MockRequests.getResponse(mockUrl1)).toEqual(mockConfig1[mockUrl1]);
        expect(MockRequests.getResponse(mockUrl3)).toEqual(mockConfig2[mockUrl3]);
    });

    it('should be able to parse different types of response bodies, including JSON and HTML', () => {
        MockRequests.configure({ ...mockConfig1, ...mockConfig2 });

        expect(typeof MockRequests.getResponse(mockUrl1)).toEqual(typeof {});
        expect(typeof MockRequests.getResponse(mockUrl3)).toEqual(typeof '');
        expect(typeof MockRequests.getResponse(mockUrl4)).toEqual(typeof '');
    });

    it('should overwrite the result of fetch for URLs mocked', async () => {
        MockRequests.configure({ ...mockConfig1, ...mockConfig2 });

        const mockFetchResponseJson = await fetch(mockUrl2).then(res => res.json());
        const mockFetchResponseText = await fetch(mockUrl4).then(res => res.text());

        expect(mockFetchResponseJson).toEqual(mockConfig1[mockUrl2]);
        expect(mockFetchResponseText).toEqual(mockConfig2[mockUrl4]);
    });

    it('should overwrite the result of XMLHttpRequest for URLs mocked', async () => {
        MockRequests.configure({ ...mockConfig1, ...mockConfig2 });

        const mockXhrJson = new XMLHttpRequest();
        mockXhrJson.open('GET', mockUrl2);
        mockXhrJson.onreadystatechange = () => {
            expect(mockXhrJson.response).toEqual(mockConfig1[mockUrl2]);
        };
        mockXhrJson.onloadend = (progressEvent) => {
            expect(mockXhrJson.response).toEqual(mockConfig1[mockUrl2]);

            const { lengthComputable, loaded, total } = progressEvent;

            expect(lengthComputable).toBe(true);
            expect(loaded).toEqual(JSON.stringify(mockXhrJson.response).length);
            expect(total).toEqual(JSON.stringify(mockXhrJson.response).length);
        };
        await mockXhrJson.send();

        const mockXhrText = new XMLHttpRequest();
        const expectedManuallyChangedStatus = 302; // HTTP code for redirect
        mockXhrText.open('GET', mockUrl4);
        mockXhrText.onreadystatechange = () => {
            mockXhrText.status = expectedManuallyChangedStatus;

            expect(mockXhrText.responseText).toEqual(mockConfig2[mockUrl4]);
            expect(mockXhrText.status).toEqual(expectedManuallyChangedStatus);
        };
        mockXhrText.onloadend = (progressEvent) => {
            expect(mockXhrText.responseText).toEqual(mockConfig2[mockUrl4]);
            expect(mockXhrText.status).toEqual(expectedManuallyChangedStatus);

            const { lengthComputable, loaded, total } = progressEvent;

            expect(lengthComputable).toBe(true);
            expect(loaded).toEqual(mockXhrText.responseText.length);
            expect(total).toEqual(mockXhrText.responseText.length);
        };
        await mockXhrText.send();
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
        MockRequests.configure(mockConfig1);

        const mockXHR = new XMLHttpRequest();
        mockXHR.open('GET', notMockedUrl);
        mockXHR.onreadystatechange = jest.fn();
        await mockXHR.send();
        expect(mockXHR.onreadystatechange).not.toHaveBeenCalled();
    });

    it('should work properly if importing individual functions instead of default import', async () => {
        const expectedJson = mockConfig1[mockUrl1];
        const expectedDataValue = expectedJson.data;

        configure(mockConfig1);
        expect(getResponse(mockUrl1).data).toEqual(expectedDataValue);

        const response = await fetch(mockUrl1).then(res => res.json());
        expect(response.data).toEqual(expectedDataValue);

        clearAllMocks();
        expect(getResponse(mockUrl1)).toBe(undefined);
    });

    describe('Event listeners', () => {
        let testPromises = [];

        async function testEventListener(xhr, eventType, testFunc) {
            return await new Promise(res => {
                xhr.addEventListener(eventType, (...args) => {
                    res(testFunc(...args));
                });
            })
        }

        function testEventProperties(
            eventObj,
            eventInit,
        ) {
            const eventType = eventObj.type;
            const targetElement = eventInit?.target;
            const defaultEventProperties = {
                type: eventType,
                bubbles: false,
                cancelable: false,
                composed: false,
                defaultPrevented: false,
                cancelBubble: false,
                target: targetElement,
                currentTarget: targetElement,
                isTrusted: false,
                eventPhase: 0,
                path: [],
                returnValue: true,
                srcElement: targetElement,
                timeStamp: 1234,
            };

            // Iterate through the default event properties if no properties specified
            const eventObjToIterateThrough = eventInit ? eventInit : defaultEventProperties;

            Object.entries(eventObjToIterateThrough).forEach(([ key, value ]) => {
                /*
                 * The below is equivalent to `expect(received).toBeOneOf([ val1, val2 ])`
                 * except the `expected` and `received` are swapped, i.e.
                 * `expect([ expectedValOption1, expectedValOption2 ]).toContain(received)`
                 *
                 * An alternative (that only works with strings) could be:
                 * `expect(received).toMatch(new RegExp(`(${expectedValOption1}|${expectedValOption2})`))`
                 */
                expect([ defaultEventProperties[key], eventInit?.[key] ]).toContain(value);
            });
        }

        function testEventFunctions(eventObj) {
            expect(eventObj.toString()).toEqual('[object Event]');

            const defaultEvent = {
                type: eventObj.type || 'DefaultEvent',
                bubbles: eventObj.bubbles || false,
                cancelable: eventObj.cancelable || false,
                cancelBubble: eventObj.cancelBubble || false,
                defaultPrevented: eventObj.defaultPrevented || false,
            };
            testEventProperties(eventObj, defaultEvent);

            const changedEvent = {
                type: 'SomeEvent',
                bubbles: true,
                cancelable: true,
            };
            eventObj.initEvent(changedEvent.type, changedEvent.bubbles, changedEvent.cancelable);
            testEventProperties(eventObj, changedEvent);

            eventObj.cancelBubble = false;
            eventObj.defaultPrevented = false;

            eventObj.preventDefault();
            testEventProperties(eventObj, { defaultPrevented: true });

            eventObj.stopPropagation();
            testEventProperties(eventObj, { bubbles: false, cancelBubble: true });

            eventObj.bubbles = true;
            eventObj.cancelBubble = false;
            testEventProperties(eventObj, { bubbles: true, cancelBubble: false });

            eventObj.stopImmediatePropagation();
            testEventProperties(eventObj, { bubbles: false, cancelBubble: true });
        }

        function testAllEventFields(eventObj, eventInit) {
            testEventProperties(eventObj, eventInit);
            testEventFunctions(eventObj);
        }

        beforeEach(() => {
            testPromises = [];
        });

        it('should work with XMLHttpRequest', async () => {
            MockRequests.configure({ ...mockConfig1, ...mockConfig2 });

            const mockXhrJson = new XMLHttpRequest();
            mockXhrJson.open('GET', mockUrl2);
            testPromises.push(testEventListener(mockXhrJson, 'readystatechange', () => {
                expect(mockXhrJson.response).toEqual(mockConfig1[mockUrl2]);
            }));
            testPromises.push(testEventListener(mockXhrJson, 'loadend', progressEvent => {
                expect(mockXhrJson.response).toEqual(mockConfig1[mockUrl2]);

                const { lengthComputable, loaded, total } = progressEvent;

                expect(lengthComputable).toBe(true);
                expect(loaded).toEqual(JSON.stringify(mockXhrJson.response).length);
                expect(total).toEqual(JSON.stringify(mockXhrJson.response).length);
            }));
            await mockXhrJson.send();

            const mockXhrText = new XMLHttpRequest();
            mockXhrText.open('GET', mockUrl4);
            testPromises.push(testEventListener(mockXhrText, 'readystatechange', () => {
                expect(mockXhrText.responseText).toEqual(mockConfig2[mockUrl4]);
            }));
            testPromises.push(testEventListener(mockXhrText, 'loadend', progressEvent => {
                expect(mockXhrText.responseText).toEqual(mockConfig2[mockUrl4]);

                const { lengthComputable, loaded, total } = progressEvent;

                expect(lengthComputable).toBe(true);
                expect(loaded).toEqual(mockXhrText.responseText.length);
                expect(total).toEqual(mockXhrText.responseText.length);
            }));
            await mockXhrText.send();

            await Promise.all(testPromises);
        });

        it('should work with XMLHttpRequest on Internet Explorer', async () => {
            MockRequests.configure(mockConfig1);

            // Make `new Event()` fail to mimic IE >= 9
            // Forces the use of `document.createEvent('Event').initEvent(...)`
            jest.spyOn(global, 'Event').mockImplementation(new Error("`Event.prototype.constructor` doesn't exist"));

            const mockXhrJsonInternetExplorer = new XMLHttpRequest();
            mockXhrJsonInternetExplorer.open('GET', mockUrl2);
            testPromises.push(testEventListener(mockXhrJsonInternetExplorer, 'readystatechange', () => {
                expect(mockXhrJsonInternetExplorer.response).toEqual(mockConfig1[mockUrl2]);
            }));
            testPromises.push(testEventListener(mockXhrJsonInternetExplorer, 'loadend', progressEvent => {
                expect(mockXhrJsonInternetExplorer.response).toEqual(mockConfig1[mockUrl2]);

                const { lengthComputable, loaded, total } = progressEvent;

                expect(lengthComputable).toBe(true);
                expect(loaded).toEqual(JSON.stringify(mockXhrJsonInternetExplorer.response).length);
                expect(total).toEqual(JSON.stringify(mockXhrJsonInternetExplorer.response).length);
            }));
            await mockXhrJsonInternetExplorer.send();

            await Promise.all(testPromises);
        });

        it('should work if there are no global Event objects', async () => {
            MockRequests.configure(mockConfig1);

            // Remove global `Event` object
            jest.spyOn(global, 'Event').mockImplementation(new Error("`Event.prototype.constructor` doesn't exist"));
            // Remove fallback `document.createEvent` function
            jest.spyOn(document, 'createEvent').mockImplementation(new Error("Either `document` or `document.createEvent()` don't exist"));

            const mockXhrJsonInternetExplorer = new XMLHttpRequest();
            mockXhrJsonInternetExplorer.open('GET', mockUrl2);
            testPromises.push(testEventListener(mockXhrJsonInternetExplorer, 'readystatechange', () => {
                expect(mockXhrJsonInternetExplorer.response).toEqual(mockConfig1[mockUrl2]);
            }));
            testPromises.push(testEventListener(mockXhrJsonInternetExplorer, 'loadend', progressEvent => {
                expect(mockXhrJsonInternetExplorer.response).toEqual(mockConfig1[mockUrl2]);

                const { lengthComputable, loaded, total } = progressEvent;

                expect(lengthComputable).toBe(true);
                expect(loaded).toEqual(JSON.stringify(mockXhrJsonInternetExplorer.response).length);
                expect(total).toEqual(JSON.stringify(mockXhrJsonInternetExplorer.response).length);

                // Test manually-mocked `Event` object
                testAllEventFields(progressEvent);
                testAllEventFields(progressEvent, { type: 'loadend', bubbles: false, cancelable: false });
            }));
            await mockXhrJsonInternetExplorer.send();

            await Promise.all(testPromises);
        });
    });
});
