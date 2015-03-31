/*jslint browser: true*/
var layouts = {},
    React = require('react'),
    Section, SectionList, EditView;

layouts.text = require('./components/text.jsx');
layouts.login = require('./components/login.js');

Section = React.createClass({displayName: 'Section',
    getDefaultProps: function () {
        'use strict';
        return {
            data: {
                title: '',
                classname: 'module',
                type: 'text',
                action: 'read'
            }
        };
    },
    change: function (state) {
        'use strict';

        // Pass on the callback.
        this.props.onChange(state);
    },
    render: function () {
        'use strict';
        var component_type;
        if (layouts[this.props.data.type] &&
            layouts[this.props.data.type][this.props.data.action]) {
            component_type = layouts
                [this.props.data.type]
                [this.props.data.action];
        } else {
            component_type = layouts.text.read;
        }
        return React.createElement(
            component_type,
            {
                data: this.props.data,
                onhandleChange: this.change
            }
        );
    }
});

/**
 * Initial layout for submitting post metadata.
 */
EditView = React.createClass({displayName: 'EditView',
    render: function () {
        'use strict';
        return React.createElement('section', {
                key: 'submit-button'
            },
            React.createElement('button', {
                    onClick: this.props.onSubmit
                },
                'Submit')
        );
    }
});

SectionList = React.createClass({displayName: 'SectionList',
    getInitialState: function () {
        'use strict';
        return this.props;
    },
    handleChange: function (state) {
        'use strict';
        this.setState({
            modules: this.state.modules.map(function (module) {
                if (module.id === state.id) { // Is this the correct module?
                    return state;
                }
                return module;
            })
        });
    },
    onSubmit: function () {
        'use strict'
        var request = new XMLHttpRequest();
        request.onload = function () {
            console.log(this.responseText);
        };
        request.open('post',
            location.origin + '/api' + location.pathname,
            true);
        request.setRequestHeader('Content-type', 'application/json');
        request.send(JSON.stringify(this.state));
    },
    render: function () {
        'use strict';
        var self = this,
            do_write = false, // Should there be an editor?
            sections = this.props.modules.map(function (module) {
                if (module.action === 'edit') {
                    do_write = true;
                }
                return React.createElement(
                    Section,
                    {
                        key: module.id,
                        data: module,
                        onChange: self.handleChange
                    }
                );
            });
        if (do_write) {

            // Add an editor.
            sections.unshift(
                React.createElement(
                    EditView,
                    {
                        key: 'editor',
                        data: this.props,
                        onSubmit: this.onSubmit
                    }
                )
            );
        }
        return (
            React.createElement(
                'article',
                null,
                sections
            )
        );
    }
});

if (global) {
    global.section = React.createFactory(SectionList);
    global.React = React;
    global.layouts = layouts;
}

module.exports = SectionList;
