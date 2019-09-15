import React from 'react';
import PropTypes from 'prop-types';
import KitsuResultCard from 'components/KitsuResultCard';

function SearchResults({ kitsuResults }) {
    if (!kitsuResults) {
        return '';
    }

    return (
        <div className={'row my-5'}>
            <div className={'col-12 mx-auto'}>
                <ul className={'list-unstyled'}>
                    {kitsuResults.data.map(kitsuResult => {
                        return (
                            <li className={'media row w-75 mb-5 mx-auto'} key={kitsuResult.id}>
                                <KitsuResultCard kitsuResult={kitsuResult} />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

SearchResults.propTypes = {
    kitsuResults: PropTypes.object
};

export default SearchResults;
