
function appendToFunction(fn, callback,name) {
    console.log(name);
    window[fn] = (function(fn){
        return function() {
            fn();
            callback();
        }
    }(window[fn]));
}
var cache = {};

function reset_modules() {
    var sections = document.getElementsByTagName('section'),
        destroy = sections.length;
    for (var x = 0; x < destroy; x++) {
        sections[0].parentElement.removeChild(sections[0]);
    }
}
function add_module(data) {
    var module = document.createElement('section');
    module.className = data.class;
    module.id = data.id;
    module.innerHTML = Handlebars.partials["modules"](data);
    document.getElementsByTagName('article')[0].appendChild(module);
}
// TODO: Use handlebars to render categories.
function add_link(data) {
    var module = document.createElement('section');
    var m_header = document.createElement('h1');
    m_header.innerHTML = '<a href="/'+data["slug"]+'">'+data["title"]+'</a>';
    module.appendChild(m_header);
    document.getElementsByTagName('article')[0].appendChild(module);
}
function loadPage(data){
    console.log(data);
    reset_modules();
    if (data["modules"]) {
        for (var x = 0; x < data["modules"].length; x++) {
            add_module(data["modules"][x]);
        }
    }
    if (data["posts"]) {
        for (var x = 0; x < data["posts"].length; x++) {
            add_link(data["posts"][x]);
        }
    }

    history.pushState({}, data["title"], "/" + data["slug"]);
    cache["/"+data["slug"]] = data;
}

function load_from_json() {
    var data = JSON.parse(this.responseText);
    loadPage(data);
}

function createCall(path){
    if (cache[path]){
        loadPage(cache[path]);
    } else {
        console.log('/api/page' + path);
        var request = new XMLHttpRequest();
        request.onload = load_from_json;
        request.open('get', '/api' + path, true);
        request.send();
    }
}

function click_event(e) {
    var e = window.e || e;
    if (e.target.tagName !== "A") {
        return;
    }
    if (location.origin + location.pathname + location.hash === e.target.href + e.target.hash) {
        e.preventDefault();
        return;
    }
    return;
    // TODO: get script loading working.
    if(e.target.href.indexOf(location.origin) >= 0) {
        e.preventDefault();
        var new_link = e.target.href.replace(location.origin,'');
        console.log(new_link);
        createCall(new_link);
    }
}
document.addEventListener('click', click_event, false);
window.addEventListener("popstate", function(e) {
    console.log("PATH",location.pathname);
    console.log("LOCATION",location);
    createCall(location.pathname);
});

var addPrefixEvent = function (element, type, callback) {
    'use strict';
    var i;
    for (i in type) {
        if (!type.hasOwnProperty(i)) {
            continue;
        }
        if (element.style[i] !== undefined) {
            element.addEventListener(type[i], callback);
        }
    }
};

var newAlert = function (alert_text) {
    'use strict';
    console.log(alert_text);
    var new_alert = document.createElement('div'),
        exit = document.createElement('button'),
        i,
        new_element;
    new_alert.classList.add('alert');
    exit.textContent = 'x';
    exit.classList.add('left');
    exit.addEventListener('click', function(event) {
        event.target.parentElement.parentElement.removeChild(event.target.parentElement);
    });
    new_alert.appendChild(exit);
    if (typeof alert_text === 'string') {
        new_element = document.createElement('span');
        new_element.textContent = alert_text;
        new_alert.appendChild(new_element);
    } else if (typeof alert_text === 'object') {
        for (i in alert_text) {
            if (!alert_text.hasOwnProperty(i)) {
                continue;
            }
            if (alert_text[i] instanceof HTMLElement) {
                new_element = alert_text[i];
            } else if (typeof alert_text[i] === 'string') {
                new_element = document.createElement('span');
                new_element.textContent = alert_text[i];
            }
            new_alert.appendChild(new_element);
        }
    }
    if (document.getElementById('alerts')) {
        addPrefixEvent(new_alert, {
            'animation': 'animationend',
            'OTAnimation': 'oAnimationEnd',
            'MozAnimation': 'transitionend',
            'WebkitAnimation': 'webkitAnimationEnd'
        }, function (event) {
            event.target.parentElement.removeChild(event.target);
        });
        if (document.getElementById('alerts').firstChild) {
            document.getElementById('alerts').insertBefore(new_alert, document.getElementById('alerts').firstChild);
        } else {
            document.getElementById('alerts').appendChild(new_alert);
        }
    } else {
        alert(new_alert.textContent);
    }
};
