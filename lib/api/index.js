var fetchPost,
    Promises = require("bluebird"),
    appFunctions = Promises.promisifyAll(require("./functions.js"));

fetchPost = function(parse_url){
    return appFunctions.get_postAsync(parse_url,{}).then(function(post){
        if (post.success) {
            return appFunctions.get_module_idsAsync(post).then(function(post){
                return appFunctions.get_modulesAsync(post);
            })
        } else {
            return post;
        }
    }).catch(function(err){
        console.log("ERR:",err)
        return {"success":false};
    })
}

module.exports = {
    fetchPost: fetchPost
}