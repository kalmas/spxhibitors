var input = require('./saved-out.json');
var fs = require('fs');

input.forEach(function(i) {
	var out = {};
	var firstName = i.fn.trim();
	var lastName = i.ln.trim();
	var publisher = i.pub.trim();
	var table = i.loc.trim();
	
	if (firstName) {
		out.f = firstName;
	}
	
	if (lastName) {
		out.l = lastName;
	}
	
	if (publisher) {
		out.p = publisher
	}
	
	if (table) {
		out.t = table;
	}
	
	out.i = [];
	i.results.items.forEach(function(j) {
		var image = {}
		//image.link = j.link;
		image.l = j.image.contextLink;
		image.t = j.image.thumbnailLink;
		
		out.i.push(image);
	});
	
	fs.appendFileSync("small.json", JSON.stringify(out) + ",");
});
