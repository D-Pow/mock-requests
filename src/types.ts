/**
 * Valid JSON primitive types.
 */
export type JsonPrimitive = (
    | string
    | number
    | boolean
    | null
    | JsonPrimitive[]
    | { [key: string]: JsonPrimitive }
);


/**
 * Function to generate mock responses dynamically.
 * Returned responses will be saved and passed as the `request` in subsequent calls.
 *
 * @param {JsonPrimitive} request - Payload/body passed in the network request.
 * @param {JsonPrimitive} response - Response object returned by the previous network call and modified by this same function.
 * @param {Object<string, string>} queryParamMap - Key-value map of query parameters from the request URL. Hash content will be stored in 'hash' key.
 * @returns {JsonPrimitive} Dynamic response; will be saved for subsequent calls.
 */
export type DynamicResponseModFn = (
    request: JsonPrimitive,
    response: JsonPrimitive,
    queryParamMap: {
        [key: string]: string
    }
) => JsonPrimitive;


/**
 * Mock configuration for a single URL.
 *
 * @type {Object}
 * @property {JsonPrimitive} [response=null] - Mock response to be returned.
 *                                             If `dynamicResponseModFn` is defined, the value defined here will be
 *                                             the first `response` argument passed into the function.
 * @property {DynamicResponseModFn} [dynamicResponseModFn=null] - Function to dynamically change the response object based on each request's contents.
 * @property {number} [delay=0] - Optional network mock resolution time.
 * @property {boolean} [usePathnameForAllQueries=false] - Optional flag to treat all URLs with the same pathname identically.
 */
export type MockResponseConfig = {
    response?: JsonPrimitive;
    dynamicResponseModFn?: DynamicResponseModFn;
    delay?: number;
    usePathnameForAllQueries?: boolean;
    responseProperties?: Record<string, unknown>;
};
