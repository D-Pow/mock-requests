// Type definitions for MockRequests
// Project: https://github.com/D-Pow/MockRequests
// Definitions by: Devon Powell

export as namespace MockRequests;
export = MockRequests;

declare namespace MockRequests {
    export function configure(apiUrlResponseConfig: object, overwritePreviousConfig?: boolean): void;
    export function configureDynamicResponses(
        urlResponseConfig: {
            [url: string]: {
                response?: any;
                dynamicResponseModFn?: (request: any, response: any) => any;
                delay?: number;
            }
        },
        overwritePreviousConfig?: boolean
    ): void;
    export function setMockUrlResponse(url: string, response?: any): void;
    export function setDynamicMockUrlResponse(
        url: string,
        responseConfig: {
            response?: any;
            dynamicResponseModFn?: (request: any, response: any) => any;
            delay?: number;
        }
    ): void;
    export function getResponse(url: string): any;
    export function deleteMockUrlResponse(url: string): boolean;
    export function clearAllMocks(): void;
    export const OriginalXHR: unknown;
    export const originalFetch: unknown;
}
