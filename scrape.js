var csv = require('csv');
var request = require('request');
var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(request);
Promise.promisifyAll(fs);

var outputFile = __dirname + '/out.json';
var inputFile = __dirname + '/data/exhibitors.csv';
//fs.truncateSync(outputFile);

var sendRequest = function(fn, ln, pub, loc) {
  var query = encodeURIComponent(fn + " " + ln + " comics");
  var url = "https://www.googleapis.com/customsearch/v1?"
      + "key="
      + "cx="
      + "searchType=image&prettyPrint=false&"
      + "q=" + query;
  
  return request.getAsync(url, function (error, response, body) {
    console.log(body);
    var out = {};
    out.fn = fn;
    out.ln = ln;
    out.pub = pub;
    out.loc = loc;
    out.results = JSON.parse(body);
    return fs.appendFileAsync(outputFile, JSON.stringify(out) + ",\n");
  });
}

var parser = csv.parse({}, function(err, data){
  var promises = [];
  
  for(var i = 0; i < data.length; i++) {
    promises.push(sendRequest(data[i][0], data[i][1], data[i][2], data[i][3]));
  }
  
  Promise.all(promises).then(function(){
    console.log('done!');
  });
});

fs.createReadStream(inputFile).pipe(parser);
