var FileSystem = require("fs-extra"), Q = require("q");

module.exports = function(path){
    return Q.nfcall(FileSystem.ensureDir, path);
}
