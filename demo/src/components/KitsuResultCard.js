import React from 'react';
import PropTypes from 'prop-types';
import Anchor from 'ui/Anchor';
import { getMyAnimeListSearchUrl } from 'utils/Functions';
import { imageIsMocked, mockedImageDataMappings } from '../../mocks/ImageDataMappings';

function KitsuResultCard({ kitsuResult }) {
    if (!kitsuResult || !kitsuResult.attributes) {
        return '';
    }

    const {
        canonicalTitle,
        synopsis,
        episodeCount,
        showType,
        posterImage: {
            small
        }
    } = kitsuResult.attributes;

    // only for demo, would not likely be done in normal apps.
    // This *should* be done using `fetch(small).then(setImgSrcToResponse)`
    // but Kitsu doesn't allow cross-origin fetch requests.
    const imgSrc = (process.env.MOCK && imageIsMocked(small))
        ? mockedImageDataMappings[small]
        : small;

    return (
        <React.Fragment>
            <Anchor href={getMyAnimeListSearchUrl(canonicalTitle)}>
                <img className={'align-self-center img-thumbnail'} src={imgSrc} alt={canonicalTitle} />
            </Anchor>
            <div className={'media-body align-self-center ml-2 mt-2'}>
                <h5>
                    <Anchor href={getMyAnimeListSearchUrl(canonicalTitle)}>
                        {canonicalTitle}
                    </Anchor>
                    {` (${episodeCount === 1 ? showType : episodeCount + ' episodes'})`}
                </h5>
                <p>{synopsis}</p>
            </div>
        </React.Fragment>
    );
}

KitsuResultCard.propTypes = {
    kitsuResult: PropTypes.object
};

export default KitsuResultCard;
