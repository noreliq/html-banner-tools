var FileSystem = require("fs-extra"),
    Q = require("q"),
    path = require("path"),
    readFileAsBuffer = require("./readFileAsBuffer.js");

function getFileExtension(path) {
    return /(?:\.([^.]+))?$/.exec(path.toLowerCase())[1];
}

/*
    
    This returns an associative array where files are grouped by extension.
    For example, the return object may look like:
    {
        "js": [{path:string, contents:string, filename:string}, {...}],
        "css": [{...}, {...}],
        "html": []
    }
    
    path property is the system path to the file including the filename
    contents property will be null - it is not populated in this function
    filename property is just the filename without the path

*/
function processFolder(sourceDir) {

    var defer = Q.defer();
    var results = {};
    FileSystem.walk(sourceDir)
        .on('data', function (item) {
            var ext = getFileExtension(item.path);
            if(ext){
                if(!results[ext]) results[ext] = [];
                results[ext].push({path: item.path, contents:null, filename:path.basename(item.path)});
            }
        })
        .on("error", defer.reject)
        .on("end", function () {
            defer.resolve(results);
        });

    return defer.promise;
}

/*
    
    This function loads the contents of the specified files object (from processFolder function)
    It only loads js, html, or css - i.e. text files - it will skip binary files
    it will attach the string contents of the file to the contents property of the existing
    object in the files object

*/
function loadFiles(files){

    var items = [];
    if(files.js) items = items.concat(files.js);
    if(files.html) items = items.concat(files.html);
    if(files.css) items = items.concat(files.css);


    var promise = items.reduce(function(promise, item){
        return promise.then(function(){
            return readFileAsBuffer(item.path);
        })
        .then(function(buffer){
            item.contents = buffer.toString();
            return item;
        });

    }, Q.when(true));

    return promise.then(function(){ return files; })
}

/*
    
    This will return (as a promise) a files object with all the files in the specified
    folder, grouped by type. If any of the files are js, css or html, their string contents
    will also be included        

*/
module.exports = function (sourceDir) {
    return processFolder(sourceDir).then(loadFiles);
}
