/*
	Discards the keys and returns just the values of an object
	as a normal array	
*/
module.exports = function(obj){
	return Object.keys(obj).map(function(key){ return obj[key] });
}