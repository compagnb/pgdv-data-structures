var fs = require("fs");
var request = require("request");

var apiKey = process.env.GMAKEY;
var addresses = fs.readFileSync("res")
  .toString()
  .split("\n")
  // Delete empty array elements
  .filter(function(n){return n});
  
var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var keyString = "&key=" + apiKey;
var meetingsData = [];

function iterateThroughArray(arr, i) {
  var addr = arr[i]
    .substr(0, arr[i].indexOf(","))
    .replace(/\s\(.*$/, "")
    .replace(/\s/g, "+");

  request(apiUrl + addr + "+New+York,+NY" + keyString, function(err, resp, body) {
    if (err) throw err;
    meetingsData.push({
      address: addr.replace(/\+/g, " "),
      latLong: { 
        lat: JSON.parse(body).results[0].geometry.location.lat,
        lng: JSON.parse(body).results[0].geometry.location.lng
      }
    });

    // if we're at the end of the array, log results.
    // Otherwise, the function calls itself again after 110ms.
    i < arr.length - 1 ? setTimeout(iterateThroughArray, 110, arr, i+1) : console.log(meetingsData);
  });
}

iterateThroughArray(addresses, 0);
