var cheerio = require("cheerio");
var request = require("request");
var async   = require("async");
var _       = require("underscore");

const API_KEY   = process.env.GMAKEY;
const API_URL   = "https://maps.googleapis.com/maps/api/geocode/json?address=";
const KEY_STR   = "&key=" + API_KEY;

module.exports = function getMeetingsFromPage(body, cb, cursor) {
  if (!API_KEY) {
    cursor.red().bold().write("✘ Missing Google API Key!\n").reset();
    return cb("missing key");
  }

  cursor.reset().write("→ Parsing page....");
  var $ = cheerio.load(body);
  cursor.horizontalAbsolute(0).eraseLine().green().write("✓ Done parsing.\n");
  
  async.mapSeries(
    _.map($("table table table tbody").children("tr"), getRowInfo),
    (item, cb) => {
      cursor.horizontalAbsolute(0).eraseLine().reset().write("→ Asking Google about " + item.address);
      getGoogleAddress(item, cb)
    },
    (err, res) => {
      if (err) console.error(err.message);
      cursor.horizontalAbsolute(0).eraseLine().reset().green().write("✓ Done getting address data from Google\n");
      cb(null, res);
    }
  );
}

function getRowInfo(row) {
  var $ = cheerio.load(row);
  var addr = getAddressFromRow($);

  return ({
    originalAddress: addr,
    address: cleanAddress(addr),
    zip: getZip(addr),
    times: getTimesFromRow($),
    isAccessible: isAccessible($),
    details: getDetails($),
    name: getLocationName($)
  });
}

function getLocationName($) {
  // @TODO Clean location Name
  return $("td:first-child h4").text();
}

function getDetails($) {
  return $("td:first-child div")
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .replace(/\s\s+/g, "")
}

function isAccessible($) {
  return $("td:first-child").find('img[alt="Wheelchair Access"]').length !== 0;
}

function getTimesFromRow($) {
  return($("td:nth-child(2)")
   .html()
   .replace(/\s\s+/g, "")
   .split("<br><br>")
   .filter((el) => el)
   .map((el) => {
     var times = el.match(/\d{1,2}:\d{1,2} [aApP][mM]/g)
       .map((str) => {
         var match = str.match(/([\d]{1,2}:[\d]{1,2}|[\d]{1,2}):([\d]{1,2}) ([aApP][mM])/);
         return {
           hour: parseInt(match[1], 10),
           minute: parseInt(match[2], 10),
           ampm: match[3]
         };
       });

     if (!times) {throw "No Times found for " + el}
     var type = el.replace(/.*<b>Meeting Type<\/b>([^<]*).*/, "$1");
     var specialInterest = el.replace(/.*<b>Special Interest<\/b>(.*)$/, "$1");

     return {
      day: el.replace(/<b>(\w+) From<\/b>.*/, "$1"),
      type: type === el ? null : type,
      specialInterest: specialInterest === el ? null : specialInterest,
      hours: {
        from: times[0],
        to: times[1]
      }
     }
   })
  );
}

function getZip(addr) {
  var zip, re;
  re = /[0-9]{5}/.exec(addr);
  return (re) ? re[0] : null;
}

function cleanAddress(addr) {
  return addr.substr(0, addr.indexOf(",")).replace(/\s\(.*$/, "")
}
  
function getGoogleAddress(item, cb) {
  request(API_URL + item.address.replace(" ", "+") + KEY_STR, function(err, resp, body) {
    if (err) throw err;
    if (JSON.parse(body).status === "ZERO_RESULTS") {throw item}

    item.googleAddress = JSON.parse(body).results[0].formatted_address;
    item.latLong = {
      lat: JSON.parse(body).results[0].geometry.location.lat,
      lng: JSON.parse(body).results[0].geometry.location.lng
    };
    setTimeout(cb, 110, null, item);
  });
}

function getAddressFromRow($, row) {
  return($("td:first-child", row)
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .replace(/\s\s+/g, "")
  );
}
