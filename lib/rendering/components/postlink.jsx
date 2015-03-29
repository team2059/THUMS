var React = require('react');

module.exports = React.createClass({displayName: 'PostLink',
    render: function () {
        'use strict';
        return (
            React.createElement('div', null,
                React.createElement('h1', null,
                React.createElement('a', {
                        className: 'section-content',
                        href: this.props.data.slug || '/'
                    },
                    this.props.data.title)
                )
            )
        );
    }
});
