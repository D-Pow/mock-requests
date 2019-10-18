import { getKitsuTitleSearchUrl } from 'utils/Functions';
import {
    kimiNoNaWaSearchQuery,
    narutoSearchQuery,
    bleachSearchQuery,
    fullmetalSearchQuery,
    attackOnTitanSearchQuery
} from 'utils/Constants';

export const kimiNoNaWaUrl = getKitsuTitleSearchUrl(kimiNoNaWaSearchQuery);
export const narutoUrl = getKitsuTitleSearchUrl(narutoSearchQuery);
export const bleachUrl = getKitsuTitleSearchUrl(bleachSearchQuery);
export const fullmetalUrl = getKitsuTitleSearchUrl(fullmetalSearchQuery);
export const attackOnTitanUrl = getKitsuTitleSearchUrl(attackOnTitanSearchQuery);
