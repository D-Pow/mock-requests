/**
 * Kitsu API to search for anime by title
 * Read more at: https://kitsu.docs.apiary.io
 */
import { getKitsuTitleSearchUrl } from 'utils/Constants';

export async function fetchKitsuTitleSearch(searchText) {
    try {
        const results = await fetch(getKitsuTitleSearchUrl(searchText));
        const json = results.json();

        return json;
    } catch (e) {
        throw e;
    }
}
