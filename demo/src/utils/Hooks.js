import { useState, useEffect } from 'react';

export function useWindowEvent(eventType, eventField = null, initialValue = null) {
    const [ value, setValue ] = useState(initialValue);

    function handleEvent(event) {
        setValue(eventField ? event[eventField] : event);
    }

    useEffect(() => {
        window.addEventListener(eventType, handleEvent);

        return () => {
            window.removeEventListener(eventType, handleEvent);
        };
    }, []);

    return [ value, setValue ];
}

export function useKeyboardEvent(type = 'down') {
    return useWindowEvent(`key${type}`, 'key');
}