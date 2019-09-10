// Type definitions for MockRequests
// Project: MockRequests
// Definitions by: Devon Powell

export as namespace MockRequests;

export interface DynamicResponseModFn {
    (request: any, response: any): any;
}

export interface MockResponseConfig {
    response?: any;
    dynamicResponseModFn?: DynamicResponseModFn;
    delay?: number;
}

export function configure(apiUrlResponseConfig: object, overwritePreviousConfig?: boolean): void;
export function configureDynamicResponses(dynamicApiUrlResponseConfig: MockResponseConfig, overwritePreviousConfig?: boolean): void;
export function setMockUrlResponse(url: string, response?: any): void;
export function setDynamicMockUrlResponse(url: string, dynamicResponseConfig: MockResponseConfig): void;
export function getResponse(url: string): any;
export function deleteMockUrlResponse(url: string): boolean;
export function clearAllMocks(): void;
export const OriginalXHR: unknown;
export const originalFetch: unknown;
