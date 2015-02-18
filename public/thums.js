
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
    if (document.getElementsByTagName('script')) {
        var destroy = document.getElementsByTagName('script').length,
            current_destroy = 0;
        for (var x = 0; x < destroy; x++) {
            if (document.getElementsByTagName('script')[current_destroy].id.indexOf('thums') >= 0) {
                current_destroy += 1;
                continue;
            }
            document.getElementsByTagName('script')[current_destroy].parentElement.removeChild(document.getElementsByTagName('script')[current_destroy]);
        }
    }
    if (data["script"]) {
        for (var x = 0; x < data["script"].length; x++) {
            var temp = document.createElement('script');
            temp.textContent = data["script"][x];
            console.log(temp);
            document.body.appendChild(temp);
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
    if(e.target.href.indexOf(location.origin) >= 0) {
        e.preventDefault();
        var new_link = e.target.href.replace(location.origin,'');
        console.log(new_link);
        createCall(new_link);
    }
}
document.addEventListener('click', click_event, false);
window.addEventListener("popstate", function(e) {
    console.log("PATH",location.pathname)
    console.log("LOCATION",location)
    createCall(location.pathname);
});