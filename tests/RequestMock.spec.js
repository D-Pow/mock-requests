import RequestMock from '../src/RequestMock';

describe('RequestMock', () => {
    it('should run', () => {
        expect(typeof RequestMock.configure).toEqual('function');
    });
});
