var Q = require("q"),
    minify = require("html-minifier").minify,
    ensureDir = require("./utils/ensureDir"),
    copyFileOrFolder = require("./utils/copyFileOrFolder.js"),
    outputFile = require("./utils/outputFile.js"),
    loadAllFiles = require("./utils/loadAllFiles.js"),
    objectToArray = require("./utils/objectToArray.js"),
    logger = require("./utils/logger.js"),
    readFileAsBuffer = require("./utils/readFileAsBuffer.js");


// creates the outputFolder path for all units in data
// stores this property on the unit config
// returns data
function processData(data){
    objectToArray(data.units).forEach(function(unit){
        unit.config.outputFolder = data.outputDestination + unit.config.folderName + "/";
    });

    return data;
}


// calls buildUnitHTML on all units in data
// returns data
function buildAll(data){
    var promise = objectToArray(data.units).reduce(function(promise, unit) {
        return promise.then(function(){
            return buildUnitHTML(unit);
        });

    }, Q.when(true));

    return promise.then(function(){ return data });
}

// ensures the outputFolder of a unit exists (creates if necessary)
// returns the unit
function checkOutputFolder(unit){
    return ensureDir(unit.config.outputFolder).then(function(){return unit});
}

// loads the shell html file, and all the other files in html source folder, for the specified unit
// it replaces the source property with the loaded files object
// returns the unit
function loadFiles(unit){
    return readFileAsBuffer(unit.config.html.shell)
        .then(function(buffer){
            unit.config.html.shell = buffer.toString();
            return unit;
        })
        .then(function(){
            return loadAllFiles(unit.config.html.source);
        })
        .then(function(files){
            unit.config.html.source = files;
            return unit;
        });
}

// replaces strings in the source string passed in and returns the new string
// the replaceObject has all the keys and values to replace
// i.e. ["var":"replace_with_this", "var":"replace_with_this"]
function replaceStrings(source, replaceObject){    
    Object.keys(replaceObject).forEach(function(key){
        var value = replaceObject[key];
        var regex = new RegExp(key, "g");
        source = source.replace(regex, value);
    });
    return source;
}

// performs the variable replace for all the text files that were loaded
// minifies and concats everything
// outputs to index.html in the units outputFolder
function processFiles(unit){

    var shellContents = unit.config.html.shell;
    var source = unit.config.html.source;
    var replace = unit.config.html.replace;

    var files = objectToArray(source).reduce(function(sources, items){
        sources = sources.concat(items);
        return sources;
    }, []);



    // REPLACE STRINGS
    shellContents = replaceStrings(shellContents, replace);
    files.forEach(function(item){
        if(item.contents){
           item.contents = replaceStrings(item.contents, replace);
        }
    });

    var promises = [];

    Object.keys(source).forEach(function(key){

        if(["html", "js", "css"].indexOf(key) != -1){
            shellContents = shellContents.replace(new RegExp("%banner_"+key+"%"), source[key][0].contents);
            // TODO: what if there is more than 1 of each type? concat?

        } else {
            source[key].forEach(function(item){
                var src = item.path;
                var destination = unit.config.outputFolder + item.filename;
                promises.push(copyFileOrFolder(src, destination));
            });
        }
    });

    // OUTPUT MAIN HTML FILE
    var destination = unit.config.outputFolder + "index.html";
    var data = minify(shellContents, {minifyCSS:true, minifyJS:true, collapseWhitespace:true});
    promises.push(outputFile(destination, data));

    return Q.all(promises);
}

// checks, loads files, and builds final HTML file, for the specified unit.
function buildUnitHTML(unit){
    return checkOutputFolder(unit)
        .then(loadFiles)
        .then(processFiles);
}

// builds the HTML for all the units in data
// returns nothing
module.exports = function(data){
    return Q.when(processData(data)).then(buildAll);
}
