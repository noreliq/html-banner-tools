var ffmpeg = require("fluent-ffmpeg"),
    Q = require("q"),
    ensureDir = require("./utils/ensureDir"),
    logger = require("./utils/logger.js"),
    FileSystem = require("fs-extra"),
    objectMerge = require("object-merge");


function transformConfig(config) {

    return getRealDuration(config)
        .then(function (realDuration) {

            // FIXME: we need to check if the source video actualy has audio
            // if it doesn't, give video total bitrate

            // TODO: make sure config.duration and realDuration are in same units!!!!!

            if(!config.duration || config.duration > realDuration){
                config.duration = realDuration;
            }

            config.targetKilobits = config.megabytes * 8000; // 8000 = 1 megabyte in kilobits
            config.totalBitrate = config.targetKilobits / config.duration;
            config.videoBitrate = Math.round(config.videoRatioPercent * config.totalBitrate);
            config.audioBitrate = Math.round((1 - config.videoRatioPercent) * config.totalBitrate);

            if(config.width && config.height){
                config.size = config.width > config.height ? "?x" + config.height : config.width + "x?";
                config.filters = ["crop=" + config.width + ":" + config.height];
            }


            return config;
        });
}

function convertVideo(config) {

    var defer = Q.defer();

    var task = ffmpeg().input(config.source)
        .on("error", defer.reject)
        .on("end", defer.resolve)
        .on("progress", function (obj) {
            logger.log("Processing video @ %i kbit/s", [obj.currentKbps]);
        });

    ensureDir(config.outputFolder)
        .then(function () {

            addToTask(task, "libx264", "libvo_aacenc", "mp4", config);
            addToTask(task, "libvpx", "libvorbis", "webm", config);
            addToTask(task, "libtheora", "libvorbis", "ogg", config);

            task.run();
        });

    return defer.promise;
}

function addToTask(task, videoCodec, audioCodec, extension, config) {

    var filePath = config.outputFolder + config.outputFile + "." + extension;

    task.output(filePath)
        .videoCodec(videoCodec)
        .videoBitrate(config.videoBitrate)
        .duration(config.duration);

    if(config.size){
        task.size(config.size);
    }

    if(config.filters){
        task.videoFilters(config.filters); // FIXME:  if source is a MOV file - size() followed by the crop filter results in a NON scaled output
    }

    if(config.fps) {
        task.fps(config.fps);
    }

    if(config.removeAudio) {
        task.noAudio();
    } else {
        task.audioCodec(audioCodec).audioBitrate(config.audioBitrate);
    }
}


function getRealDuration(config) {
    return Q.nfcall(ffmpeg.ffprobe, config.source)
        .then(function (metadata) {
            return metadata.format.duration;
        });
}

module.exports = function (config, ffmpegPath, ffprobePath) {
    if(ffmpegPath)     ffmpeg.setFfmpegPath(ffmpegPath);
    if(ffprobePath)    ffmpeg.setFfprobePath(ffprobePath);
    return Q.when(transformConfig(config)).then(convertVideo);
}
