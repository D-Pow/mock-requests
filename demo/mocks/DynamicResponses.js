import MockRequests from 'mock-requests';
import { kitsuTitleSearchUrl } from 'services/Urls';
import { getKitsuTitleSearchUrl } from 'utils/Functions';
import {
    kimiNoNaWaSearchQuery,
    narutoSearchQuery,
    bleachSearchQuery,
    fullmetalSearchQuery,
    attackOnTitanSearchQuery
} from 'utils/Constants';
import {
    kimiNoNaWaResponse,
    narutoResponse,
    bleachResponse,
    fullmetalResponse,
    attackOnTitanResponse
} from './StaticResponses';

const queryResponseMap = {
    [kimiNoNaWaSearchQuery]: kimiNoNaWaResponse,
    [narutoSearchQuery]: narutoResponse,
    [bleachSearchQuery]: bleachResponse,
    [fullmetalSearchQuery]: fullmetalResponse,
    [attackOnTitanSearchQuery]: attackOnTitanResponse
};

const searchQueryParam = kitsuTitleSearchUrl.substring(kitsuTitleSearchUrl.indexOf('?') + 1, kitsuTitleSearchUrl.indexOf('='));

export async function chooseMockBasedOnQuery(request, response, queryParamMap) {
    const searchQuery = decodeURIComponent(queryParamMap[searchQueryParam]);
    const queryIsMocked = Object.keys(queryResponseMap).includes(searchQuery);

    if (!queryIsMocked) {
        return await MockRequests.originalFetch(getKitsuTitleSearchUrl(searchQuery)).then(res => res.json());
    }

    return queryResponseMap[searchQuery];
}
