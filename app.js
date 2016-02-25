var readFileAsBuffer = require("./scripts/utils/readFileAsBuffer.js"),
    bufferToJson = require("./scripts/utils/bufferToJson.js"),
    buildVideos = require("./scripts/buildVideos.js"),
    buildImages = require("./scripts/buildImages.js"),
    buildHTML = require("./scripts/buildHTML.js"),
    zipOutput = require("./scripts/zipOutput.js"),
    generateLinks = require("./scripts/generateLinks.js"),
    processData = require("./scripts/processData.js");



var datafile = "data.json";
var configfile = "config.json";
var buildVideosFlag = true;

var args = require('minimist')(process.argv.slice(2));

if(args['datafile']){
	datafile = args['datafile'];
}

if(args['configfile']){
	configfile = args['configfile'];
}

if(args['skipvideos']){
	buildVideosFlag = false
}


// This loads the data and config files, allowing commandline args to specify path to these
// then turns them into json and combines them into a single object for processing
function loadFiles(){
	var dataJSON;

	return readFileAsBuffer(datafile)
	.then(bufferToJson)
	.then(function(result){
		dataJSON = result;
		return readFileAsBuffer(configfile);
	})
	.then(bufferToJson)
	.then(function(result){		
		result.units = dataJSON;		
		return result;
	});
}


loadFiles()
.then(processData)
.then(buildHTML)
.then(buildImages)
.then(zipOutput)
.then(generateLinks)
.then(function(result){
	if(buildVideosFlag){
		return buildVideos(result);
	}	
})
.catch(handleError);


function handleError(error){
    console.log(error.message);
}
