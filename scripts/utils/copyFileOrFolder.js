var FileSystem = require("fs-extra"), Q = require("q");

module.exports = function(source, destination){
    return Q.nfcall(FileSystem.copy, source, destination);
}
