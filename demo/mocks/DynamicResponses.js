import MockRequests from 'mock-requests';
import { getKitsuTitleSearchUrl } from 'utils/Functions';
import { kitsuSearchQueryParamKey, queryParamResponseMap } from './UrlResponseMappings';

/**
 * Dynamic response function used to determine what response to return based on network request.
 * Will serve as the `mockResponseConfig.dynamicResponseModFn` in the
 * `MockRequests.configureDynamicResponses()` call.
 *
 * Here, we use the `queryParamMap` from the requested URL to determine if the title the user
 * searched for is mocked or not.
 *
 * If it is mocked, return the mock response. Otherwise, make an actual `fetch` call to get the
 * response from the back-end.
 *
 * @param {*} request - Request payload in POST.
 *     Not used because searches are done via query parameters.
 * @param {*} response - The previous response returned by `dynamicResponseModFn`.
 *     Not used because we generate our own response from the `queryParamMap`.
 * @param {Object} queryParamMap - Key-Value mapping from requested URL.
 *     Used to determine what the user searched for because search queries for Kitsu are done in the
 *     `?filter[text]=` query parameter.
 * @returns {Promise<{}>} - The response for the network request.
 *     Either the mock response (if search value is mocked) or actual fetch request (if not mocked).
 */
export async function chooseMockBasedOnQuery(request, response, queryParamMap) {
    // queryParamMap = { [kitsuSearchQueryParamKey]: 'what the user searched' }
    const searchQuery = decodeURIComponent(queryParamMap[kitsuSearchQueryParamKey]);
    const queryIsMocked = searchQuery in queryParamResponseMap;

    if (!queryIsMocked) {
        return await MockRequests.originalFetch(getKitsuTitleSearchUrl(searchQuery)).then(res => res.json());
    }

    return queryParamResponseMap[searchQuery];
}
