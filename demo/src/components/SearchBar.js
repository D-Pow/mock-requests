import React, { useState } from 'react';

function SearchBar(props) {
    const [ typedText, setTypedText ] = useState('');

    return (
        <div>
            <input type={'text'} value={typedText} onChange={e => setTypedText(e.target.value)} />
        </div>
    )
}

export default SearchBar;
