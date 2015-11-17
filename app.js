var readFileAsBuffer = require("./scripts/utils/readFileAsBuffer.js"),
    bufferToJson = require("./scripts/utils/bufferToJson.js"),
    buildVideos = require("./scripts/buildVideos.js"),
    buildImages = require("./scripts/buildImages.js"),
    buildHTML = require("./scripts/buildHTML.js"),
    processData = require("./scripts/processData.js");



readFileAsBuffer("data.json")
.then(bufferToJson)
.then(processData)
.then(buildHTML)
.then(buildImages)
.then(buildVideos)
.catch(handleError);


function handleError(error){
    console.log("my handler: ", error);
}
