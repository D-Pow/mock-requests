import React from 'react';
import ReactDOM from 'react-dom';
import 'styles/index.scss';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import App from 'components/App';

const rootDiv = document.getElementById('root');

ReactDOM.render(
    <App />,
    rootDiv
);

// hot reloading
if (process.env.NODE_ENV !== 'production' && module.hot) {
    console.log('hot reloading active');
    module.hot.accept('components/App', () => {
        const NextApp = require('components/App').default;
        ReactDOM.render(
            <NextApp />,
            rootDiv
        )
    })
}
