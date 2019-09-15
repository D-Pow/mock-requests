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
