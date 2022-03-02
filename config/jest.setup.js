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
global.Request = jest.fn((url, options) => ({
    url,
    text: () => Promise.resolve(options ? options.body : '')
}));
global.Headers = class Headers {
    constructor(init = {}) {
        Object.entries(init).forEach(([ key, value ]) => this[key] = value);
    }

    has(key) {
        return this.hasOwnProperty(key);
    }

    get(key) {
        return this[key];
    }

    set(key, value) {
        this[key] = value;

        return this;
    }

    append(key, value) {
        if (this[key]) {
            this[key] += `,${value}`;
        } else {
            this[key] = value;
        }

        return this;
    }

    delete(key) {
        delete this[key];

        return this;
    }

    clear() {
        this.keys().forEach(key => {
            delete this[key];
        });

        return this;
    }

    get length() {
        return Object.keys(this).length;
    }

    keys() {
        return Object.keys(this);
    }

    values() {
        return Object.values(this);
    }

    entries() {
        // Native `Headers.prototype.entries` reverses key/value
        return Object.entries(this).map(([ key, value ]) => [ value, key ]);
    }

    forEach(func) {
        this.entries().forEach((keyValueArrayPair, index) => {
            func(keyValueArrayPair, index, this);
        });

        return this;
    }

    map(func) {
        return this.entries().map((keyValueArrayPair, index) => {
            return func(keyValueArrayPair, index, this);
        });
    }

    reduce(func, initialValue) {
        return this.entries().reduce((prevValue, keyValueArrayPair, index) => {
            return func(prevValue, keyValueArrayPair, index, this);
        }, initialValue);
    }

    toString() {
        return this[Symbol.toPrimitive](typeof '');
    }

    toJSON(key) {
        if (this.get(key)) {
            return this.get(key);
        }

        return this[Symbol.toPrimitive]();
    }

    [Symbol.toPrimitive](requestedType) {
        if (requestedType === typeof '') {
            return `[object ${this.constructor.name}]`;
        }

        if (requestedType === typeof 0) {
            return this.length;
        }

        return JSON.parse(JSON.stringify(this));
    }
};


/**
 * Util class for mocking creation and dispatching of events.
 *
 * TODO See if `EventTarget` exists in JSDom. If it does, maybe use that instead.
 *  See: [EventTarget polyfill implementation]{@link https://github.com/benlesh/event-target-polyfill/blob/master/index.js}
 *
 * @see [MDN docs - EventTarget]{@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget}
 */
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

    /**
     * Mock `addEventListener` function to add the event listeners to the mock event queue
     * for testing.
     *
     * @param {string} elemId - Unique identifier for the element for which to run event listeners.
     * @param {string} eventType - Type of event.
     * @param {function} func - Event handler function.
     * @param {Object} bindThis - Element or object on which to bind the value of `this` when `func` is called.
     */
    static addEventListener(elemId, eventType, func, bindThis) {
        if (bindThis) {
            func.bind(bindThis);
        }

        if (MockEvent.elemEventListeners[elemId]) {
            if (MockEvent.elemEventListeners[elemId][eventType]) {
                MockEvent.elemEventListeners[elemId][eventType].push(func);
            } else {
                MockEvent.elemEventListeners[elemId][eventType] = [ func ];
            }
        } else {
            MockEvent.elemEventListeners[elemId] = {
                [eventType]: [ func ],
            };
        }
    }

    /**
     * Gets all event listener functions for the specified element/eventType/event object,
     * or all listeners if none specified.
     *
     * @param {string} elemId - Unique identifier for the element for which to run event listeners.
     * @param {string} eventType - Type of event.
     * @param {boolean} deleteAfter - If the event listeners should be removed from the event queue after returning them.
     * @returns {function[]} - Array of event listener functions matching the parameter(s) query.
     */
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

    /**
     * Runs all event listeners for the specified element/eventType/event object,
     * or all listeners if none specified.
     *
     * Passes the `event` object to the event listeners.
     *
     * @param {string} elemId - Unique identifier for the element for which to run event listeners.
     * @param {string} eventType - Type of event.
     * @param {Event} event - Specific event object to pass to event listener functions (Note: only `event.type` is used to identify listener functions).
     * @returns {Promise<any[]>} - All the results of calling the matching event listener(s) functions.
     */
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
    if (typeof document !== typeof undefined) {
        jest.spyOn(document, 'createEvent').mockImplementation((...args) => new MockEvent(...args));
    }

    // Browsers and NodeJS
    global.dispatchEvent = global.dispatchEvent || (() => {});
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
