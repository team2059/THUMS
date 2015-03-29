/* jshint browser:true */
/* global section */
/* global React */
var container = document.getElementById('container'),
    props = JSON.parse(document.getElementById('props').innerHTML);

if (section) {
    Object.keys(section).map(function (i) {
        'use strict';
        return React.createFactory(i);
    });
    React.render(section(props), container);
}

function createCall(path, callback) {
    'use strict';
    var request = new XMLHttpRequest();
    request.onload = callback;
    request.open('get', '/api' + path, true);
    request.send();
}

function clickEvent(e) {
    'use strict';
    e = window.e || e;
    if (e.target.tagName !== 'A') {
        return;
    }
    if (location.hostname !== e.target.hostname) {
        return;
    } else {
        e.preventDefault();
    }
    createCall(e.target.pathname, function () {
        React.render(section(JSON.parse(this.responseText)), container);
        history.pushState(null, null, e.target.href);
    });
}

document.addEventListener('click', clickEvent, false);
