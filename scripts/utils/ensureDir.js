/*
	checks for the existence of a dir at path specified,
	and creates it if it does not exist

	returns a promise which returns nothing

 */

var FileSystem = require("fs-extra"), Q = require("q");

module.exports = function(path){
    return Q.nfcall(FileSystem.ensureDir, path);
}
