import { kitsuTitleSearchUrl } from 'services/Urls';
import { getKitsuTitleSearchUrl } from 'utils/Functions';
import {
    attackOnTitanSearchQuery,
    bleachSearchQuery,
    fullmetalSearchQuery,
    kimiNoNaWaSearchQuery,
    narutoSearchQuery
} from 'utils/Constants';
import {
    kimiNoNaWaResponse,
    narutoResponse,
    bleachResponse,
    fullmetalResponse,
    attackOnTitanResponse
} from './StaticResponses';
import { chooseMockBasedOnQuery } from './DynamicResponses';

export const kitsuSearchQueryParamKey = kitsuTitleSearchUrl.substring(kitsuTitleSearchUrl.indexOf('?') + 1, kitsuTitleSearchUrl.indexOf('='));

export const queryParamResponseMap = {
    [kimiNoNaWaSearchQuery]: kimiNoNaWaResponse,
    [narutoSearchQuery]: narutoResponse,
    [bleachSearchQuery]: bleachResponse,
    [fullmetalSearchQuery]: fullmetalResponse,
    [attackOnTitanSearchQuery]: attackOnTitanResponse
};

export const staticUrlResponseConfig = Object.keys(queryParamResponseMap).reduce((fullUrlConfig, searchQuery) => {
    fullUrlConfig[getKitsuTitleSearchUrl(searchQuery)] = queryParamResponseMap[searchQuery];

    return fullUrlConfig;
}, {});

export const dynamicSearchConfigFromQueries = {
    [kitsuTitleSearchUrl]: {
        dynamicResponseModFn: chooseMockBasedOnQuery,
        usePathnameForAllQueries: true
    }
};
