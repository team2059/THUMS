var React = require('react');

module.exports = React.createClass({displayName: 'Text',
    render: function () {
        'use strict';
        return (
            React.createElement('div', null,
                React.createElement('h1', null, this.props.data.title),
                React.createElement('p', {className: 'section-content'},
                    JSON.parse(this.props.data.content).content || ''
                )
            )
        );
    }
});
