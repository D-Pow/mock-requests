import React, { useState } from 'react';
import PropTypes from 'prop-types';

function SearchBar(props) {
    const [ typedText, setTypedText ] = useState('');

    return (
        <div className={'row my-5'}>
            <div className={'col-xs-12 mx-auto'}>
                <div className={'input-group my-3'}>
                    <input
                        className={'form-control input-large remove-focus-highlight'}
                        type={'text'}
                        placeholder={'e.g. "Kimi no na wa"'}
                        value={typedText}
                        onChange={e => setTypedText(e.target.value)}
                    />
                    <div className={'input-group-append'}>
                        <button className={'btn btn-outline-secondary'} onClick={props.handleSubmit}>
                            <i className={'fas fa-search'} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

SearchBar.propTypes = {
    handleSubmit: PropTypes.func
};

SearchBar.defaultProps = {
    handleSubmit: () => {}
};

export default SearchBar;
