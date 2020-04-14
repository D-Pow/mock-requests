import { fetchKitsuTitleSearch } from 'services/Kitsu';
import { kimiNoNaWaSearchQuery } from 'utils/Constants';

// Mock network requests using default MockRequests configuration in mocks/MockConfig.js
import '../../mocks/MockConfig';

describe('Services', () => {
    describe('Kitsu service', () => {
        it('should resolve JSON responses from Kitsu API', async () => {
            const kimiNoNaWaResponse = await fetchKitsuTitleSearch(kimiNoNaWaSearchQuery);

            expect(kimiNoNaWaResponse.data).toBeDefined();
            expect(kimiNoNaWaResponse.data.length).toBeGreaterThan(0);
        });
    });
});
