import React from 'react';
import PropTypes from 'prop-types';

function Spinner(props) {
    if (!props.show) {
        return '';
    }

    return (
        <div className={'spinner-border spinner-border-sm'} />
    );
}

Spinner.propTypes = {
    show: PropTypes.bool
};

export default Spinner;
