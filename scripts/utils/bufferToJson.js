/* 
	converts a specified buffer into JSON
	after stripping out comments

	returns an JSON object/array

*/

module.exports = function(data){
	data = data.toString();		
	// strip out comments
	data = data.replace(/\/\*[\s\S]*?\*\//g, "");	
	data = JSON.parse(data);	
	return data;
}