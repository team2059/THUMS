var layouts = {},
    React = require('react'),
    Section, SectionList;

layouts.text = require('./components/text.jsx');
layouts.postlink = require('./components/postlink.jsx');

Section = React.createClass({displayName: 'Section',
    render: function () {
        'use strict';
        return React.createElement('section', null,
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
