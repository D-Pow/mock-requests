import '@babel/polyfill';

global.XMLHttpRequest = jest.fn(() => {
    return {
        open: () => {},
        send: () => {},
        dispatchEvent: function (...args) {
            return global.dispatchEvent(this, ...args)
        },
        addEventListener: function (eventType, func) {
            global.MockEvent && global.MockEvent.addEventListener(
                this.url,
                eventType,
                func,
                this,
            );
        },
    };
});
global.fetch = jest.fn(() => Promise.resolve({
    json: () => ({ realFetchResponse: 'realFetchResponse' }),
    text: () => 'realFetchResponse'
}));
global.Headers = jest.fn();
global.Request = jest.fn((url, options) => ({
    url,
    text: () => Promise.resolve(options ? options.body : '')
}));



global.MockEvent = class MockEvent {
    /** @type {{ [elementId]: { [eventType]: function[] } }} */
    static elemEventListeners = {};

    constructor(
        type,
        {
            bubbles = false,
            cancelable = false,
            composed = false
        } = {}
    ) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.composed = composed;
    }

    // IE >= 9
    initEvent(type, bubbles, cancelable) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
    }

    static clearAll() {
        MockEvent.elemEventListeners = {};
    }

    static addEventListener(id, eventType, func, bindThis) {
        if (bindThis) {
            func.bind(bindThis);
        }

        if (MockEvent.elemEventListeners[id]) {
            if (MockEvent.elemEventListeners[id][eventType]) {
                MockEvent.elemEventListeners[id][eventType].push(func);
            } else {
                MockEvent.elemEventListeners[id][eventType] = [ func ];
            }
        } else {
            MockEvent.elemEventListeners[id] = {
                [eventType]: [ func ],
            };
        }
    }

    static getEventListenerFunctions({ elemId, eventType, deleteAfter } = {}) {
        let funcs;
        const elemEventListeners = MockEvent.elemEventListeners[elemId] || {};

        if (elemId != null && eventType != null) {
            funcs = elemEventListeners[eventType];

            if (deleteAfter) {
                delete elemEventListeners[eventType];
            }
        } else if (elemId != null) {
            funcs = Object.values(elemEventListeners).flat();

            if (deleteAfter) {
                delete MockEvent.elemEventListeners[elemId];
            }
        } else if (eventType != null) {
            funcs = Object.values(MockEvent.elemEventListeners) // [ { eventType1: [ func1, func2 ], eventType2: [ func3 ] }, { eventTypeX: [ func ] } ]
                .flatMap(Object.entries)
                .filter(([ registeredEventType ]) => registeredEventType === eventType)
                .flatMap(([ registeredEventType, funcArray ]) => funcArray);

            if (deleteAfter) {
                Object.keys(MockEvent.elemEventListeners)
                    .forEach(id => {
                        delete MockEvent.elemEventListeners[id][eventType];
                    });
            }
        } else {
            funcs = Object.values(MockEvent.elemEventListeners)
                .flatMap(Object.values)
                .flat();

            if (deleteAfter) {
                MockEvent.clearAll();
            }
        }

        return funcs || [];
    }

    static async runAllEventListeners({ elemId, eventType, event } = {}) {
        if (event) {
            eventType = event.type;
        }

        const queuedEvents = MockEvent.getEventListenerFunctions({
            elemId,
            eventType,
            deleteAfter: true,
        });

        return await Promise.all(queuedEvents.map(func => func(event)));
    }
}


function toggleEventObjectMocks(activateMock = true) {
    if (!activateMock) {
        jest.restoreAllMocks();
        return;
    }

    // Modern browsers
    jest.spyOn(global, 'Event').mockImplementation((...args) => new MockEvent(...args));
    // IE >= 9
    jest.spyOn(document, 'createEvent').mockImplementation((...args) => new MockEvent(...args));
    // Browsers and NodeJS
    jest.spyOn(global, 'dispatchEvent').mockImplementation(jest.fn((xhrObj, event) => {
        MockEvent.runAllEventListeners({
            elemId: xhrObj.url,
            eventType: event.type,
            event,
        });
    }));
}


beforeEach(() => {
    toggleEventObjectMocks();
    MockEvent.clearAll();
});

afterEach(() => {
    toggleEventObjectMocks(false);
    MockEvent.clearAll();
});
