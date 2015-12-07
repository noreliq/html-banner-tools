var Q = require("q"),
	objectToArray = require("./utils/objectToArray.js"),
	objectMerge = require("object-merge"),
	getFileStats = require("./utils/getFileStats.js"),
	convertImage = require("./convertImage.js");

var defaults = {
	kilobytes:40,
	border:false
}

function convertImages(data){
	var promise = objectToArray(data.units).reduce(function(promise, unit) {		
		return objectToArray(unit.config.images).reduce(function(promise, config) {			
			return promise.then(function(){ return convertImage(config); });			
		}, promise);	
		
	}, Q.when(true));
	
	return promise.then(function(){ return data });
}


function processData(data){
	objectToArray(data.units).forEach(function(unit){		
		var images = unit.config.images;		
		Object.keys(images).forEach(function(imageId){
			
			// Merge defaults
			var image = objectMerge(defaults, images[imageId]);	
			
			// If no set format, use same as source
			if(!image.format)	image.format = /\.(\w*)$/igm.exec(image.source)[1];				
			
			// Generate output folder and file paths
			image.outputFolder = data.outputDestination + unit.config.folderName + "/";			
			image.outputFile = imageId + "." + image.format;			
			
			// Override old image data with processed data
			images[imageId] = image;
		});
	});
	
	return data;
}

function validateData(data){
	var promises = objectToArray(data.units).map(function(unit) {
		
		return Object.keys(unit.config.images).map(function(imageId){
			var image = unit.config.images[imageId];
			
			if(!image.source){
				image._invalid = true;
				logger.log("Image '%s' in Unit '%s' is missing a source path. It will not be generated.", [imageId, unit.id], "red");
			}
			
			// TODO: validate allowed source formats?
			
			return getFileStats(image.source).catch(function(error){
				image._invalid = true;
				logger.log("Image '%s' in Unit '%s' source file not found. It will not be generated.", [imageId, unit.id], "red");
			});			
		});		
	});	
	
	return Q.all(promises).then(function(){ return data });
}

module.exports = function (data){
	return Q.when(processData(data)).then(validateData).then(convertImages);
}
