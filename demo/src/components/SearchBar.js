import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useKeyboardEvent } from 'utils/Hooks';

function SearchBar(props) {
    const [ isExpanded, setIsExpanded ] = useState(false);

    const handleTyping = ({ target: { value }}) => {
        props.handleTyping(value);
    };

    const handleSuggestionClick = query => {
        handleTyping({ target: { value: query }});
        setIsExpanded(false);
        props.handleSubmit(query);
    };

    const [ keyDown, setKeyDown ] = useKeyboardEvent();

    if (keyDown === 'Enter') {
        props.handleSubmit();
        setKeyDown(null);
    }

    // font-awesome replaces <i/> with <svg/> so wrap in a tag
    // that will always be the same so React can mount/unmount as needed
    const defaultDisplay = (<span><i className={'fas fa-search'} /></span>);
    const renderedDisplay = props.btnDisplay ? props.btnDisplay : defaultDisplay;

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
                        <button className={'btn btn-outline-secondary remove-focus-highlight'} onClick={() => props.handleSubmit()}>
                            {renderedDisplay}
                        </button>
                        {window.isMocked && (
                            <React.Fragment>
                                <button
                                    className={'btn btn-outline-secondary dropdown-toggle dropdown-toggle-split remove-focus-highlight'}
                                    onClick={() => setIsExpanded(!isExpanded)}
                                />
                                <div className={`dropdown-menu w-100 d-${isExpanded ? 'block' : 'none'}`}>
                                    <div className={'dropdown-item'}>Mocked responses</div>
                                    <div role={'separator'} className={'dropdown-divider'} />
                                    {window.mockedSearchQueries.map(query => (
                                        <a className={'dropdown-item'} onClick={() => handleSuggestionClick(query)} href={'#'} key={query}>
                                            {query}
                                        </a>
                                    ))}
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

SearchBar.propTypes = {
    btnDisplay: PropTypes.node,
    value: PropTypes.string,
    handleTyping: PropTypes.func,
    handleSubmit: PropTypes.func
};

SearchBar.defaultProps = {
    btnDisplay: null,
    value: '',
    handleTyping: () => {},
    handleSubmit: () => {}
};

export default SearchBar;
