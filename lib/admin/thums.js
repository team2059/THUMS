
function appendToFunction(fn, callback,name) {
    console.log(name);
    window[fn] = (function(fn){
        return function() {
            fn();
            callback();
        }
    }(window[fn]));
}
var on_reload = function () {};

function reset_modules() {
    var sections = document.getElementsByTagName('section'),
        destroy = sections.length;
    for (var x = 0; x < destroy; x++) {
        sections[0].parentElement.removeChild(sections[0]);
    }
}
function add_module(data) {
    var module = document.createElement('section');
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
function load_from_json() {
    var data = JSON.parse(this.responseText);
    on_reload = function () {};
    console.log(data);
    reset_modules();
    for (var x = 0; x < data["modules"].length; x++) {
        add_module(data["modules"][x]);
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
            /*var temp_scripts = temp.getElementsByTagName('script'),
             temp_len = temp_scripts.length;
             console.log(temp_scripts);
             console.log("LENGTH: "+temp_len)
             for (var x = 0; x < temp_len; x++) {
             console.log(temp_scripts[x]);
             console.log(x);
             console.log("LENGTH: "+temp_len);
             document.body.appendChild(temp_scripts[x]);
             }*/
        }
    }
    /*var all_scripts = document.getElementsByTagName('script');
     console.log(all_scripts);
     for (var x = 0; x < all_scripts.length; x++) {
     if (all_scripts[x].className !== "generated") {
     console.log(x);
     continue;
     }
     all_scripts[x].parentElement.removeChild(all_scripts[x]);
     document.body.appendChild(all_scripts[x]);
     console.log(all_scripts[x]);
     }*/
    history.pushState({},data["title"],"/"+data["slug"]);
    on_reload();
}
function click_event(e) {
    var e = window.e || e;
    if (e.target.tagName !== "A") {
        return;
    }
    if(e.target.href.indexOf(location.origin) >= 0) {
        e.preventDefault();
        var new_link = e.target.href.replace(location.origin,'');
        console.log('/api/page'+new_link);
        var request = new XMLHttpRequest();
        request.onload = load_from_json;
        request.open('get','/api/page'+new_link, true);
        request.send();
    }
}
document.addEventListener('click', click_event, false);