import MockRequests from 'mock-requests';
import {
    searchMocksConfig,
    dynamicSearchConfigFromQueries
} from './UrlResponseMappings';

/**
 * The below two configuration methods are identical in that they map the known search
 * queries to saved mock JSON responses. This illustrates two of the ways you can use MockRequests.
 */

/**
 * 1. Configuring static URL-response object mappings
 */
MockRequests.configure(searchMocksConfig);

/**
 * 2. Configuring dynamic URL responses, in this case using the queryParamMap to
 * determine which response to return
 */
// MockRequests.configureDynamicResponses(dynamicSearchConfigFromQueries);
