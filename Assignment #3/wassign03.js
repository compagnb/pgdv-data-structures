var fs = require("fs");
var request = require("request");

var apiKey = process.env.GMAKEY;
var addresses = fs.readFileSync("res").toString().split("\n");
var apiUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var keyString = "&key=" + apiKey;
var meetingsData = [];

var i = 0; 

function timeOut() {
  if (i < addresses.length) {
    var addr = addresses[i]
      .substr(0, addresses[i].indexOf(","))
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

      if(i === addresses.length-2) {
        console.log(meetingsData);
      }

      i++;

      if (i < addresses.length - 1) {
        setTimeout(timeOut, 110); // function calls itself
      }
    });
  }
}

timeOut();
