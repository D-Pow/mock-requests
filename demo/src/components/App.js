import React from 'react';

function App() {
    const pageText = {
        title: 'Anime search'
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
            </div>
        </div>
    );
}

export default App;
