import MockRequests from 'mock-requests';
import { getKitsuTitleSearchUrl } from 'utils/Functions';
import { kitsuSearchQueryParamKey, queryParamResponseMap } from './UrlResponseMappings';

export async function chooseMockBasedOnQuery(request, response, queryParamMap) {
    // queryParamMap = { [kitsuSearchQueryParamKey]: 'what the user searched' }
    const searchQuery = decodeURIComponent(queryParamMap[kitsuSearchQueryParamKey]);
    const queryIsMocked = Object.keys(queryParamResponseMap).includes(searchQuery);

    if (!queryIsMocked) {
        return await MockRequests.originalFetch(getKitsuTitleSearchUrl(searchQuery)).then(res => res.json());
    }

    return queryParamResponseMap[searchQuery];
}
