import MockRequests from '../src/MockRequests';

const mockUrl = 'https://example.com';
const mockConfig = {
    [mockUrl]: { data: 'myData' }
};

describe('Using Request with fetch', () => {
    it('should parse Request objects if used in fetch', async () => {
        MockRequests.configure(mockConfig);

        const expected = mockConfig[mockUrl];
        const request = new Request(mockUrl, {
            method: 'POST',
            body: expected
        });
        const response = await fetch(request).then(res => res.json());

        expect(typeof response).toEqual(typeof {});
        expect(response.data).toEqual(expected.data);
    });
});
