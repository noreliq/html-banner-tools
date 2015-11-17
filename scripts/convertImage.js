/*

    Converts a single image. Only outputs JPG for now.


    Accepts a config object
    {
        config.outputFolder,    // String. Required. The path the folder where the output image should be saved. Should include "/" on the end.
        config.outputFile,      // String. Required. The name of the file to use for the output image.
        config.source,          // String. Required. The path to the source image file.
        config.align,           // String. Optional. If cropping, use this to specify which area of the image to keep. Values can be one of:
                                    NorthWest, North, NorthEast, West, Center, East, SouthWest, South or SouthEast
        config.width,           // Number. Required. The desired width for the converted image.
        config.height,          // Number. Required. The desired height for the converted image.
        config.border,          // Boolean. Optional. If true, this will add a 1px black border around the image. This will not increase the
                                    width or height of the converted image.
        config.kilobytes        // Number. Required. The desired filesize for the converted image.
    }

*/

var Q = require("q"),
    ensureDir = require("./utils/ensureDir.js"),
    imagemagick = require("imagemagick");


function convert(params){
    return Q.nfcall(imagemagick.convert, params);
}

function checkOutputFolder(config){
    return ensureDir(config.outputFolder).then(function(){return config});
}

function buildParams(config){
    var params = [config.source];

    if(config.align) {
        params.push("-gravity", config.align);
    }

    if(config.width && config.height){
        params.push("-resize", (config.width+"x"+config.height + "^"));
        params.push("-crop", (config.width+"x"+config.height+"+0+0"));
    }

    if(config.border) {
        params.push(
            "-shave", "1x1",
            "-bordercolor", "#000000",
            "-border", "1"
           );
    }

    // TODO: force JPEG format

    params.push("-define", ("jpeg:extent="+config.kilobytes+"kb"));

    // destination
    params.push(config.outputFolder + config.outputFile);

    return params;
}

module.exports = function(config){
    return checkOutputFolder(config)
        .then(buildParams)
        .then(convert);
}
