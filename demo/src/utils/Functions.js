import { kitsuTitleSearchUrl, myAnimeListSearchUrl } from 'utils/Constants';

export const getSearchUrl = (domainUrl, searchText) => domainUrl + encodeURIComponent(searchText);

export const getKitsuTitleSearchUrl = searchText => getSearchUrl(kitsuTitleSearchUrl, searchText);

export const getMyAnimeListSearchUrl = searchText => getSearchUrl(myAnimeListSearchUrl, searchText);

export function extractUsedKitsuFields(response) {
    return response.data.reduce((results, kitsuResult) => {
        const {
            id,
            attributes: {
                canonicalTitle,
                synopsis,
                episodeCount,
                showType,
                posterImage: {
                    small
                }
            }
        } = kitsuResult;
        const reducedAttr = {
            id,
            attributes: {
                canonicalTitle,
                synopsis,
                episodeCount,
                showType,
                posterImage: {
                    small
                }
            }
        };

        results.data.push(reducedAttr);

        return results;
    }, { data: [] });
}
