/* 
	copies a file or folder depending on whats specified
	as the source, and copies it to specified location

	returns a promise that returns nothing

*/

var FileSystem = require("fs-extra"), Q = require("q");

module.exports = function(source, destination){
    return Q.nfcall(FileSystem.copy, source, destination);
}
