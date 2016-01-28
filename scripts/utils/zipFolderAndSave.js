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