var fs = require("fs");
var request = require("request");

var apiKey = process.env.GMAKEY;
var addresses = fs.readFileSync("res")
  .toString()
  .split("\n")
  // Delete empty array elements
  .filter(function(n){return n});
  
var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var keyStr = "&key=" + apiKey;
var meetingsData = [];

function iterateOverArray(arr, i) {
  var addr = arr[i]
    .substr(0, arr[i].indexOf(","))
    .replace(/\s\(.*$/, "")
    .replace(/\s/g, "+");

  request(apiUrl + addr + "+New+York,+NY" + keyStr, function(err, resp, body) {
    if (err) throw err;
    meetingsData.push({
      address: addr.replace(/\+/g, " "),
      latLong: { 
        lat: JSON.parse(body).results[0].geometry.location.lat,
        lng: JSON.parse(body).results[0].geometry.location.lng
      }
    });

    // If we're at the end of the array, log results.
    // Otherwise, the function calls itself again after 110ms with i+1
    i < arr.length - 1 ? setTimeout(iterateOverArray, 110, arr, i+1) : console.log(meetingsData);
  });
}

iterateOverArray(addresses, 0);
