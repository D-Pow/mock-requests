global.XMLHttpRequest = undefined;
global.fetch = undefined;

describe('RequestMock without async functions defined in `window`', () => {
    it('should not overwrite fetch/XMLHttpRequest if it is not defined in the browser', async () => {
        const module = await import('../src/RequestMock');
        const RequestMockWithoutAsync = module.default;

        expect(RequestMockWithoutAsync.originalFetch).toBe(undefined);
        expect(RequestMockWithoutAsync.OriginalXHR).toBe(undefined);
    });
});
