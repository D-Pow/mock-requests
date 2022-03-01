/**
 * API to configure mocks for your application.
 *
 * @module mock-requests
 */

/**
 * @name {@link MockRequests}
 * @type {namespace}
 */

/*
 * Must import whole module so that the default import on the
 * user's end offers autocompletion in the IDE from the
 * MockRequests.d.ts module's documentation.
 */
import 'core-js';
import * as MockRequestsModule from './MockRequests';

const MockRequests = MockRequestsModule;

export default MockRequests;


// Named exports
export * from './MockRequests';
