import {
    kimiNoNaWaUrl,
    narutoUrl,
    bleachUrl,
    fullmetalUrl,
    attackOnTitanUrl
} from './Urls';
import {
    kimiNoNaWaResponse,
    narutoResponse,
    bleachResponse,
    fullmetalResponse,
    attackOnTitanResponse
} from './StaticResponses';

export const searchMocksConfig = {
    [kimiNoNaWaUrl]: kimiNoNaWaResponse,
    [narutoUrl]: narutoResponse,
    [bleachUrl]: bleachResponse,
    [fullmetalUrl]: fullmetalResponse,
    [attackOnTitanUrl]: attackOnTitanResponse
};
