var React = require('react'),
    components = require('./compile.js'),
    sectionList = React.createFactory(components);

module.exports = (function () {
    'use strict';
    return {
        render: function (params) {
            return React.renderToString(
                sectionList(params)
            );
        }
    };
})();
