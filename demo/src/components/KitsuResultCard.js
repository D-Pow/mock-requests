import React from 'react';
import PropTypes from 'prop-types';

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
            original
        }
    } = kitsuResult.attributes;

    return (
        <React.Fragment>
            <img src={original} alt={canonicalTitle} />
            <div className={'media-body'}>
                <h5>{canonicalTitle}</h5>
                <p>{synopsis}</p>
            </div>
        </React.Fragment>
    );
}

KitsuResultCard.propTypes = {
    kitsuResult: PropTypes.object
};

export default KitsuResultCard;
