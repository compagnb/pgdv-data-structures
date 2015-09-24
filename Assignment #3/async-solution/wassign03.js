var fs = require("fs");
var request = require('request'); // npm install request
var async = require('async'); // npm install async

// SETTING ENVIRONMENT VARIABLES (in Linux): 
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.GMAKEY;

var meetingsData = [];
var addresses = fs.readFileSync("resultsFromLastTime.txt")
  .toString()
  .split("\n")
  // Delete empty array elements
  .filter(function(n){return n});

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    //clean up the address
    var addr = value
      .substr(0, value.indexOf(","))
      .replace(/\s\(.*$/, "")
      .replace(/\s/g, "+");

    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + addr + '&key=' + apiKey;
    
    var thisMeeting = new Object;
    thisMeeting.address = value;

    request(apiRequest, function(err, resp, body) {
      if (err) {throw err;}
      if(body.status === "ZERO_RESULTS") {
        console.log("ZERO RESULTS for" + thisMeeting.address);
      } else {
        thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
        meetingsData.push(thisMeeting);
      }
    });
    setTimeout(callback, 300);
}, function() {

    fs.writeFile("./" + "resultsFromThisTime.txt", JSON.stringify(meetingsData) + "\n", function(err){
      console.log("Wrote " + meetingsData.length + " entries to file " + "resultsFromThisTime.txt");
    });

});

