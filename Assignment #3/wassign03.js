var fs      = require("fs");
var request = require("request");

const API_KEY   = process.env.GMAKEY;
const API_URL   = "https://maps.googleapis.com/maps/api/geocode/json?address=";
const KEY_STR   = "&key=" + API_KEY;
const FILE_NAME = "resLatLong.txt";

var meetingsData = [];

var addresses = fs.readFileSync("res")
  .toString()
  .split("\n")
  // Delete empty array elements
  .filter(n => n);
  
// Define a function that iterates over the array,
// retrieving lat/long for each item and calling
// itself until it reaches the end of the array it is passed.
function iterateOverArray(arr, i) {
  var addr = arr[i]
    .substr(0, arr[i].indexOf(","))
    .replace(/\s\(.*$/, "")
    .replace(/\s/g, "+");

  request(API_URL + addr + "+New+York,+NY" + KEY_STR, function(err, resp, body) {
    if (err) throw err;
    meetingsData.push({
      address: addr.replace(/\+/g, " "),
      latLong: { 
        lat: JSON.parse(body).results[0].geometry.location.lat,
        lng: JSON.parse(body).results[0].geometry.location.lng
      }
    });
    
    console.log("Retrieved LatLong for " + addr.replace(/\+/g, " "));

    // If we're at the end of the array, write results to file.
    // Otherwise, the function calls itself again after 110ms with i+1
    if(i < arr.length - 1) {
      setTimeout(iterateOverArray, 110, arr, i+1)
    } else {
      if (err) throw err;
      fs.writeFile("./" + FILE_NAME, JSON.stringify(meetingsData) + "\n", function(err){
        console.log("Wrote " + meetingsData.length + " entries to file " + FILE_NAME);
    });
    }
  });
}

// Call the function on our array with i = 0
iterateOverArray(addresses, 0);
