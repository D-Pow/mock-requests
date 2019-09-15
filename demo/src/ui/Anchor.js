import React from 'react';

function Anchor({ className, href, children, ...aria }) {
    const cls = className ? className + ' text-secondary' : 'text-secondary';

    return (
        <a
            className={cls}
            href={href}
            target={'_blank'}
            {...aria}
        >
            {children}
        </a>
    );
}

export default Anchor;
