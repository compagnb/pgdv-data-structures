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
    _.chain($("table table table tbody").children("tr"))
      .map(getRowInfo)
      .map(getAddressFromRow)
      .map(cleanAddress)
      .map(getNameFromRow)
      .map(cleanAddress)
      .value(),
    getGoogleAddress,
    (err, res) => {
      if (err) console.error(err.message);
      cb(null, res);
    }
  );
}

function getRowInfo(row) {
  var addr = getAddressFromRow(row);

  return {
    originalAddress: addr,
    address: cleanAddress(addr),
    zip: getZip(addr),
    name: getNameFromRow(row)
  };
}

function getNameFromRow(row) {
  var $ = cheerio.load(row);
  return($("td:nth-child(2)", row)
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .replace(/\s\s+/g, "")
  );
}

function getZip(addr) {
  var zip, re;
  re = /[0-9]{5}/.exec(addr);
  return zip = (re) ? re[0] : null;
}

function cleanAddress(item) {
  return addr.substr(0, item.indexOf(",")).replace(/\s\(.*$/, "")
}
  
function getGoogleAddress(item, cb) {
  request(API_URL + item.googleAddress + KEY_STR, function(err, resp, body) {
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

function getAddressFromRow(item) {
  var $ = cheerio.load(item);
  return($("td:first-child", item)
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .replace(/\s\s+/g, "")
  );
}
