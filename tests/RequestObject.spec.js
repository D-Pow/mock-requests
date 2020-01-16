import MockRequests from '../src/MockRequests';

const mockUrl = 'https://example.com';
const mockConfig = {
    [mockUrl]: { data: 'myData' }
};

describe('Using Request with fetch', () => {
    it('should parse Request objects if used in fetch', async () => {
        MockRequests.configure(mockConfig);

        const expected = mockConfig[mockUrl];

        const requestWithoutBody = new Request(mockUrl);
        const responseWithoutBody = await fetch(requestWithoutBody).then(res => res.json());

        const requestWithBody = new Request(mockUrl, {
            method: 'POST',
            body: expected
        });
        const responseWithBody = await fetch(requestWithBody).then(res => res.json());

        expect(typeof responseWithoutBody).toEqual(typeof {});
        expect(responseWithoutBody.data).toEqual(expected.data);
        expect(typeof responseWithBody).toEqual(typeof {});
        expect(responseWithBody.data).toEqual(expected.data);
    });
});
