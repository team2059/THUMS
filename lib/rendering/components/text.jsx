var React = require('react');

module.exports = {
    read: React.createClass({displayName: 'Text',
        getDefaultProps: function () {
            'use strict';
            return {
                data: {
                    title: '',
                    content: {
                        self: ''
                    }
                }
            };
        },
        render: function () {
            'use strict';
            return React.createElement('div', null,
                React.createElement('h1', null, this.props.data.title),
                React.createElement('p', {className: 'section-content'},
                    JSON.parse(this.props.data.content).self
                )
            );
        }
    }),
    link: React.createClass({displayName: 'Text',
        getDefaultProps: function () {
            'use strict';
            return {
                data: {
                    title: '',
                    slug: '/'
                }
            };
        },
        render: function () {
            'use strict';
            return React.createElement('div', null,
                React.createElement('h1', null,
                    React.createElement('a', {
                            className: 'section-content',
                            href: this.props.data.slug || '/'
                        },
                        this.props.data.title)
                )
            );
        }
    })
};

