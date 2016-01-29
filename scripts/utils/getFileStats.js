/* 
	return the native node filesystem file stats for a given file

	returns a promise

*/

var Q = require("q"), FileSystem = require("fs-extra");

module.exports = function(path){	
	return Q.nfcall(FileSystem.stat, path);
}