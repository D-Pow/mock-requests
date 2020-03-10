describe('Global field variabilities', () => {
    describe('MockRequests without async functions defined in `window`', () => {
        it('should not overwrite fetch/XMLHttpRequest if it is not defined in the browser', async () => {
            global.XMLHttpRequest = undefined;
            global.fetch = undefined;
            const module = await import('../src/MockRequests');
            const MockRequestsWithoutAsync = module.default;

            expect(MockRequestsWithoutAsync.originalFetch).toBe(undefined);
            expect(MockRequestsWithoutAsync.OriginalXHR).toBe(undefined);
        });
    });
});
