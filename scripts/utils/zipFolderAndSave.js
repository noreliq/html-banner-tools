/*
	This takes the path to a folder, and zips up that folder 
	with the folder name as the file name, in the same location
	as the folder

	returns a promise which returns nothing
 */

var EasyZip = require('easy-zip').EasyZip,
	Q = require("q");

module.exports = function(folderPath){
	var zip = new EasyZip();	
	var defer = Q.defer();

	zip.zipFolder(folderPath, function(){
		zip.writeToFile(folderPath + ".zip", function(){			
			defer.resolve();
		});
	});

	return defer.promise;
}