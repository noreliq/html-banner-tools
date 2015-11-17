module.exports = function(data){
	data = data.toString();	
	// strip out comments
	data = data.replace(/\/\*[^\*\/]*\*\//ig, "");		
	data = JSON.parse(data);	
	return data;
}