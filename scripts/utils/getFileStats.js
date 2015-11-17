var Q = require("q"), FileSystem = require("fs-extra");

module.exports = function(path){	
	return Q.nfcall(FileSystem.stat, path);
}