var csv = require('csv');
var request = require('request');
var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(request);
Promise.promisifyAll(fs);

var outputFile = __dirname + '/out.csv';
fs.truncateSync(outputFile);

var sendRequest = function(fn, ln) {
  var query = fn + "+" + ln + "+comics";
  var url = "https://www.googleapis.com/customsearch/v1?"
      + "key=AIzaSyCv--h7Flibww-SBp-w1RIZZcy9aJuSDfo&"
      + "cx=015686502764539130054:2fatvo7axao&"
      + "searchType=image&prettyPrint=false&"
      + "q=" + query;
  
  return request.getAsync(url, function (error, response, body) {
    var out = {};
    out.results = JSON.parse(body);
    return fs.appendFileAsync(outputFile, JSON.stringify(out));
  });
}

var parser = csv.parse({}, function(err, data){
  var promises = [];
  
  for(var i = 0; i < 1; i++) {
    promises.push(sendRequest(data[i][0], data[i][1]));
  }
  
  Promise.all(promises).then(function(){
    console.log('done!');
  });
});

fs.createReadStream(__dirname + '/exhibitors.csv').pipe(parser);
