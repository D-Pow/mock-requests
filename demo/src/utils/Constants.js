export const kitsuTitleSearchUrl = 'https://kitsu.io/api/edge/anime?filter[text]=';
export const myAnimeListSearchUrl = 'https://myanimelist.net/anime.php?q=';

export const getSearchUrl = (domainUrl, searchText) => domainUrl + encodeURIComponent(searchText);

export const getKitsuTitleSearchUrl = searchText => getSearchUrl(kitsuTitleSearchUrl, searchText);

export const getMyAnimeListSearchUrl = searchText => getSearchUrl(myAnimeListSearchUrl, searchText);
