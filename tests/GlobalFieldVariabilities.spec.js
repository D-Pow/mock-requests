const origGlobalName = 'window';
const origGlobalObj = global[origGlobalName];
const globalNameOptions = [ 'window', 'global', 'self' ];
const OrigXHR = global.XMLHttpRequest;
const origFetch = global.fetch;

describe('Global field variabilities', () => {
    beforeEach(() => {
        jest.resetModules();
        globalNameOptions.forEach(globalName => delete global[globalName]);

        global[origGlobalName] = origGlobalObj;
        global.XMLHttpRequest = OrigXHR;
        global.fetch = origFetch;
    });

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
