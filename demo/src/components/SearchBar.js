import React from 'react';
import PropTypes from 'prop-types';

function SearchBar(props) {
    const handleTyping = ({ target: { value }}) => {
        props.handleTyping(value);
    };

    return (
        <div className={'row my-5'}>
            <div className={'col-xs-12 mx-auto'}>
                <div className={'input-group my-3'}>
                    <input
                        className={'form-control input-large remove-focus-highlight'}
                        type={'text'}
                        placeholder={'e.g. "Kimi no na wa"'}
                        value={props.value}
                        onChange={handleTyping}
                    />
                    <div className={'input-group-append'}>
                        <button className={'btn btn-outline-secondary remove-focus-highlight'} onClick={props.handleSubmit}>
                            <i className={'fas fa-search'} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

SearchBar.propTypes = {
    value: PropTypes.string,
    handleTyping: PropTypes.func,
    handleSubmit: PropTypes.func
};

SearchBar.defaultProps = {
    value: '',
    handleTyping: () => {},
    handleSubmit: () => {}
};

export default SearchBar;
