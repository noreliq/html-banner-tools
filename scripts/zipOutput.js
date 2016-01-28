var zip = require("./utils/zipFolderAndSave.js"),
	FileSystem = require('fs-extra'),
	Q = require("q"),
	path = require('path');



function getDirectories(srcpath) {
  return FileSystem.readdirSync(srcpath).filter(function(file) {
    return FileSystem.statSync(path.join(srcpath, file)).isDirectory();
  });
}

module.exports = function(data){
	if(!data.zip) return data;

	var promises = getDirectories(data.outputDestination).reduce(function(memo, folder){
		memo.push(zip(data.outputDestination + folder));
		return memo;
	}, []);

	return Q.all(promises).then(function(){
		return data;
	});
}