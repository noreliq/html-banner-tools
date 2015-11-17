var convertVideo = require("./convertVideo.js"),
    logger = require('./utils/logger.js'),
    Q = require("q"),
    objectMerge = require("object-merge"),
    getFileStats = require("./utils/getFileStats.js"),
    objectToArray = require("./utils/objectToArray.js");

var defaults = {
    removeAudio:false,
    videoRatioPercent: 0.8,
    megabytes:2
};

function run(data){
    var promise = objectToArray(data.units).reduce(function(promise, unit){
        return objectToArray(unit.config.videos).reduce(function(promise, config){
            return promise.then(function(){
                return convertVideo(config, data.ffmpegBinary, data.ffprobeBinary);
            });
        }, promise);

    }, Q.when(true));

    return promise.then(function(){ return data });
}

function processData(data){
    objectToArray(data.units).forEach(function(unit){
        var videos = unit.config.videos;
        Object.keys(videos).forEach(function(videoId){

            // Merge defaults
            var video = objectMerge(defaults.video, videos[videoId]);

            // TODO: to stop processing multiple videos with the exact same config
            // keep a cache of the configs we process, and if we get more than
            // 1 of the same, add an attribute that says 'copyFrom' and point to the location
            // as defined in below 2 lines.
            // then in the run method, if copyFrom exists, dont call convertVideo,
            // instead just copy the existing

            // Generate output folder and file paths
            video.outputFolder = data.outputDestination + unit.config.folderName + "/";
            video.outputFile = videoId;

            // Override old data with processed data
            videos[videoId] = video;
        });
    });
    return data;
}

function validateData(data){
    var promises = objectToArray(data.units).map(function(unit){
        return Object.keys(unit.config.videos).map(function(videoId){
            var video = unit.config.videos[videoId];

            if(!video.source){
                video._invalid = true;
                logger.log("Video '%s' in Unit '%s' is missing a source path. It will not be generated.", [videoId, unit.id], "red");
            }

            return getFileStats(video.source).catch(function(error){
                video._invalid = true;
                logger.log("Video '%s' in Unit '%s' source file not found. It will not be generated.", [videoId, unit.id], "red");
            });
        });
    });

    return Q.all(promises).then(function(){ return data });
}

module.exports = function(data){
    return Q.when(processData(data)).then(validateData).then(run);
}
