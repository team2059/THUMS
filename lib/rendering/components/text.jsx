var React = require('react'),
    markdown = require('marked');

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
            return React.createElement('section', {
                    className: this.props.data.classname
                },
                React.createElement('h1', null, this.props.data.title),
                React.createElement('div', {
                        className: 'section-content',
                        dangerouslySetInnerHTML: {
                            __html: this.props.data.content.self
                        }
                    }
                )
            );
        }
    }),
    edit: React.createClass({displayName: 'Text',
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
        getInitialState: function () {
            'use strict';
            return this.props.data;
        },
        handleChange: function (event) {
            'use strict';
            var new_state = this.state;
            if (event.target.id === 'section-title') {
                new_state.title  = event.target.value;
            } else if (event.target.id === 'section-text') {
                new_state.content.source = event.target.value;
                new_state.content.self = markdown(event.target.value);
            }
            this.setState(new_state);
            this.props.onhandleChange(new_state);
        },
        render: function () {
            'use strict';
            return React.createElement('div', null,
                React.createElement('section', {
                    className: 'module half'
                },
                    React.createElement('input', {
                        id: 'section-title',
                        onChange: this.handleChange,
                        value: this.state.title
                    }),
                    React.createElement('textarea', {
                            className: 'section-content',
                            id: 'section-text',
                            onChange: this.handleChange,
                            value: this.state.content.source
                        }
                    )
                ), React.createElement('section', {
                        className: 'module half'
                    },
                     React.createElement('div', null,
                        React.createElement('h1', {}, this.state.title),
                        React.createElement('div', {
                                className: 'section-content',
                                dangerouslySetInnerHTML: {
                                    __html: this.props.data.content.self
                                }
                            }
                        )
                    )
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
            return React.createElement('section', {
                className: this.props.data.classname
            },
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

