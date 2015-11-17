var Q = require("q"),
    objectToArray = require("./utils/objectToArray.js"),
    logger = require("./utils/logger.js"),
    objectMerge = require("object-merge");


var defaults = {
    root:{
        outputDestination:"output/"
    },
    unit:{
        extends:null,
        description:{},
        config:{
            html:{},
            videos:{},
            images:{}
        }
    }
};

/*
    Turns the array of units into a keyed object using the ID
    Also checks for missing or duplicate IDs
*/
function transformIds(data){
    data.units = data.units.reduce(function(memo, unit){

        if(!unit.id){
            logger.log("Unit missing an ID", [], "red");
            return memo;
        }

        if(memo[unit.id]){
            logger.log("Unit already exists with ID '%s'", [unit.id], "red");
            return memo;
        }

        memo[unit.id] = unit;

        return memo;
    }, {});

    return data;
}

function mergeExtends(data){
    Object.keys(data.units).forEach(function(id){
        var unit = data.units[id];
        var parent = data.units[unit.extends];
        if(parent)    data.units[id] = objectMerge(parent, unit);
    });
    return data;
}

function mergeDefaults(data){

    // root
    data = objectMerge(defaults.root, data);

    // each unit
    Object.keys(data.units).forEach( function(id){ data.units[id] = objectMerge(defaults.unit, data.units[id]) });

    return data;
}

function generateUnitFolderNames(data){
    objectToArray(data.units).forEach(function(unit){
        unit.config.folderName = Object.keys(unit.description).reduce(function(memo, key){
            var value = unit.description[key];
            memo.push(value);
            return memo;
        }, []).join("-");

    });
    return data;
}

module.exports = function(data){
    return Q.when(transformIds(data))
        .then(mergeExtends)
        .then(mergeDefaults)
        .then(generateUnitFolderNames);
};
