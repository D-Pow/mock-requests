import {
    kitsuTitleSearchUrl,
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

export function chooseMockBasedOnQuery(request, response, queryParamMap) {
    const searchQuery = decodeURIComponent(queryParamMap[searchQueryParam]);
    return queryResponseMap[searchQuery];
}
