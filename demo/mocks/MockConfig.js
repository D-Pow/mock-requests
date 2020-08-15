import MockRequests from 'mock-requests';
import { kitsuTitleSearchUrl } from 'services/Urls';
import { staticUrlResponseConfig } from './UrlResponseMappings';
import { chooseMockBasedOnQuery } from './DynamicResponses';

/**
 * The below two configuration methods are identical in that they map the known search
 * queries to saved mock JSON responses. This illustrates two of the ways you can use MockRequests.
 */

const useStaticMock = true;

if (useStaticMock) {
    /**
     * Example 1: Configuring static URL-response object mappings.
     *
     * Maps the full search URL to the mock response.
     *
     * e.g. "https://kitsu.io/api/edge/anime?filter[text]=naruto" -> `narutoResponse`
     */
    MockRequests.configure(staticUrlResponseConfig);
} else {
    /**
     * Example 2: Configuring dynamic URL responses using the search query parameter.
     *
     * By setting the `usePathnameForAllQueries` flag, the `dynamicResponseModFn` will
     * be used to determine which mock response should be returned based on the network
     * requests' query parameter.
     *
     * e.g.
     *     if (searchQuery in mockConfig) {
     *         return mockConfig[searchQuery];
     *     } else {
     *         return MockRequests.originalFetch(searchUrl + searchQuery);
     *     }
     *
     * Note that `chooseMockBasedOnQuery(request, response, queryParamMap)` will call
     * `MockRequests.originalFetch()` if the query parameter isn't mocked.
     * This allows mocks to be mixed with actual network calls through your own
     * custom logic.
     */
    MockRequests.configureDynamicResponses({
        [kitsuTitleSearchUrl]: {
            dynamicResponseModFn: chooseMockBasedOnQuery,
            usePathnameForAllQueries: true
        }
    });
}
