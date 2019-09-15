import React, { useState } from 'react';
import SearchBar from 'components/SearchBar';
import SearchResults from 'components/SearchResults';
import { fetchKitsuTitleSearch } from 'services/Kitsu';
import Spinner from 'components/Spinner';

function App() {
    const pageText = {
        title: 'Anime search',
        description: `Search for any anime you want.${
            window.isMocked
                ? ' Some JSON responses have already been mocked (see dropdown).'
                : ''
        }`
    };

    const [ typedText, setTypedText ] = useState('');
    const [ kitsuResults, setKitsuResults ] = useState(null);
    const [ showSpinner, setShowSpinner ] = useState(false);

    const handleSubmit = async selectedDropdownText => {
        setShowSpinner(true);
        const searchQuery = selectedDropdownText || typedText;
        const response = await fetchKitsuTitleSearch(searchQuery.toLowerCase());
        setKitsuResults(response);
        setShowSpinner(false);
    };

    const renderedTitle = (
        <div className={'row mt-5'}>
            <div className={'col-12 text-center mx-auto'}>
                <h1>{pageText.title}</h1>
            </div>
        </div>
    );

    const renderedDescription = (
        <div className={'row mt-3'}>
            <div className={'col-12 col-md-6 text-center mx-auto'}>
                <h6>{pageText.description}</h6>
            </div>
        </div>
    );

    const renderedSearchButtonContent = showSpinner ? <Spinner show={showSpinner} /> : null;

    return (
        <div className={'container'}>
            <div className={'text-center mx-auto'}>
                {renderedTitle}
                {renderedDescription}
                <SearchBar btnDisplay={renderedSearchButtonContent} value={typedText} handleTyping={setTypedText} handleSubmit={handleSubmit} />
                <SearchResults kitsuResults={kitsuResults} />
            </div>
        </div>
    );
}

export default App;
