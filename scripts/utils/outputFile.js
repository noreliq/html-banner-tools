/*
	outputs a buffer or string to a file on disk.
	destPath must be a system path including the filename
*/

var FileSystem = require("fs-extra"), Q = require("q");

module.exports = function(destPath, data){
    return Q.nfcall(FileSystem.outputFile, destPath, data);
}
