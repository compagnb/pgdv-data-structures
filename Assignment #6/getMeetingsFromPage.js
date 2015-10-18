var cheerio = require("cheerio");
var request = require("request");
var async   = require("async");
var _       = require("underscore");

const API_KEY   = process.env.GMAKEY;
const API_URL   = "https://maps.googleapis.com/maps/api/geocode/json?address=";
const KEY_STR   = "&key=" + API_KEY;

module.exports = function getMeetingsFromPage(body, cb) {
  if (!API_KEY) {throw "MUST provide GMAKEY"}
  var $ = cheerio.load(body);
  
  async.mapSeries(
    _.map($("table table table tbody").children("tr"), getRowInfo),
    getGoogleAddress,
    (err, res) => {
      if (err) console.error(err.message);
      cb(null, res);
    }
  );
}

function getRowInfo(row) {
  var $ = cheerio.load(row);
  var addr = getAddressFromRow($);

  console.log(getLocationName($));

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
  // @TODO Parse
  return($("td:nth-child(2)")
    .text()
    .replace(/\s\s+/g, "")
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
