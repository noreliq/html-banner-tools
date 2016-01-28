var outputFile = require("./utils/outputFile.js");

module.exports = function(data){
	if(!data.generateLinks) return data;

	var str = "<html><head><style>ul, li { list-style:none; padding:0px; margin:0px; font-family:'Verdana' } li+li { margin-top: 20px; }</style></head><body><ul>";

	Object.keys(data.units).forEach(function(key){
		var unit = data.units[key].config.folderName;		
		str += "<li><a href='" + (unit + "/index.html") + "'>" + unit + "</a></li>";
	});

	str += "</ul></body></html>";

	return outputFile(data.outputDestination + "/index.html", str).then(function(){ return data });
}