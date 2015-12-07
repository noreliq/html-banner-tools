var readFileAsBuffer = require("./scripts/utils/readFileAsBuffer.js"),
    bufferToJson = require("./scripts/utils/bufferToJson.js"),
    buildVideos = require("./scripts/buildVideos.js"),
    buildImages = require("./scripts/buildImages.js"),
    buildHTML = require("./scripts/buildHTML.js"),
    processData = require("./scripts/processData.js");



// This loads the data and config files, allowing commandline args to specify path to these
// then turns them into json and combines them into a single object for processing
function loadFiles(){
	var datafile = "data.json";
	var configfile = "config.json";

	var args = require('minimist')(process.argv.slice(2));

	if(args['datafile']){
		datafile = args['datafile'];
	}

	if(args['configfile']){
		configfile = args['configfile'];
	}

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
//.then(buildHTML)
//.then(buildImages)
//.then(buildVideos)
.catch(handleError);


function handleError(error){
    console.log(error);
}
