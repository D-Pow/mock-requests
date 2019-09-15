import React, { useState } from 'react';
import SearchBar from 'components/SearchBar';
import SearchResults from 'components/SearchResults';
import { fetchKitsuTitleSearch } from 'services/Kitsu';

function App() {
    const pageText = {
        title: 'Anime search'
    };

    const [ typedText, setTypedText ] = useState('');
    const [ kitsuResults, setKitsuResults ] = useState(null);

    const handleSubmit = async () => {
        const response = await fetchKitsuTitleSearch(typedText.toLowerCase());
        setKitsuResults(response);
    };

    const renderedTitle = (
        <div className={'row mt-5'}>
            <div className={'col-xs-12 text-center mx-auto'}>
                <h1>{pageText.title}</h1>
            </div>
        </div>
    );

    return (
        <div className={'container'}>
            <div className={'text-center mx-auto'}>
                {renderedTitle}
                <SearchBar value={typedText} handleTyping={setTypedText} handleSubmit={handleSubmit} />
                <SearchResults kitsuResults={kitsuResults} />
            </div>
        </div>
    );
}

export default App;
