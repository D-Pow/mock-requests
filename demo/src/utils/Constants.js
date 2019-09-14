export const kitsuTitleSearchUrl = 'https://kitsu.io/api/edge/anime?filter[text]=';

export const getSearchUrl = (domainUrl, searchText) => domainUrl + encodeURIComponent(searchText);

export const getKitsuTitleSearchUrl = searchText => getSearchUrl(kitsuTitleSearchUrl, searchText);
