/*

	Reads a file from disk and returns its contents
	as a buffer
	
*/

var FileSystem = require("fs-extra"), Q = require("q");

module.exports = function(path){
	return Q.nfcall(FileSystem.readFile, path);
}
