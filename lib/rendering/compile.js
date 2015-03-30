var layouts = {},
    React = require('react'),
    Section, SectionList;

layouts.text = require('./components/text.jsx');
layouts.postlink = require('./components/postlink.jsx');
layouts.login = require('./components/login.js');

Section = React.createClass({displayName: 'Section',
    getDefaultProps: function () {
        'use strict';
        return {
            data: {
                title: '',
                classname: 'module',
                type: 'text'
            }
        };
    },
    render: function () {
        'use strict';
        return React.createElement('section', {
                'className': this.props.data.classname
            },
            React.createElement(
                layouts[this.props.data.type] || layouts.text,
                {data: this.props.data}
            )
        );
    }
});

SectionList = React.createClass({displayName: 'SectionList',
    render: function () {
        'use strict';
        var sections = this.props.modules.map(function (module) {
            return React.createElement(
                Section,
                {key: module.id,
                    data: module}
            );
        });
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
