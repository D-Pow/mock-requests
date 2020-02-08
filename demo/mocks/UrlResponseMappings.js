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

const kimiNoNaWaUrl = getKitsuTitleSearchUrl(kimiNoNaWaSearchQuery);
const narutoUrl = getKitsuTitleSearchUrl(narutoSearchQuery);
const bleachUrl = getKitsuTitleSearchUrl(bleachSearchQuery);
const fullmetalUrl = getKitsuTitleSearchUrl(fullmetalSearchQuery);
const attackOnTitanUrl = getKitsuTitleSearchUrl(attackOnTitanSearchQuery);

export const queryParamResponseMap = {
    [kimiNoNaWaSearchQuery]: kimiNoNaWaResponse,
    [narutoSearchQuery]: narutoResponse,
    [bleachSearchQuery]: bleachResponse,
    [fullmetalSearchQuery]: fullmetalResponse,
    [attackOnTitanSearchQuery]: attackOnTitanResponse
};

export const staticUrlResponseConfig = {
    [kimiNoNaWaUrl]: kimiNoNaWaResponse,
    [narutoUrl]: narutoResponse,
    [bleachUrl]: bleachResponse,
    [fullmetalUrl]: fullmetalResponse,
    [attackOnTitanUrl]: attackOnTitanResponse
};

export const dynamicSearchConfigFromQueries = {
    [kitsuTitleSearchUrl]: {
        dynamicResponseModFn: chooseMockBasedOnQuery,
        usePathnameForAllQueries: true
    }
};
