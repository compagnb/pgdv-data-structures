var request       = require("request");
var async         = require("async");
var fs            = require("fs");
var cheerio       = require("cheerio");
var MongoClient   = require("mongodb").MongoClient;
var ansi          = require('ansi');
var cursor        = ansi(process.stdout);

var getMeetingsFromPage = require("./getMeetingsFromPage.js");

if(!process.env.IP) { process.env.IP = "127.0.0.1" }

const url = "mongodb://" + process.env.IP + ":27017/meetings";
const meetingsUrl = 'http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=02&borough=M';

async.waterfall([
  // Check if MongoDB is running
  (cb) => {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        cursor.red().bold().write("✘ Could not connect to MongoDB\n").reset();
        return cb(err);
      }
      cursor.green().write("✓ Found MongoDB.\n");
      db.close();
      cb();
    });
  }, 
  // Get page from URL
  (cb) => {
    cursor.reset().write("→ Retrieving page from " + meetingsUrl);
    request(meetingsUrl, function (err, res, body) {
      if(err) cb(err);
      cursor.green().write("\n✓ Retrieved Page.\n");
      cb(null, body);
    });
  },
  // Parse meetings & call Google API
  (body, cb) => {
    getMeetingsFromPage(body, cb, cursor);
  },
  // Write results to MongoDB
  (res, cb) => {
    cursor.reset().write("Writing to Mongo DB...");
    MongoClient.connect(url, function(err, db) {
      if (err) {return console.dir(err);}
      db.collection("meetings").insert(res);
      db.close();
      cursor.horizontalAbsolute(0).eraseLine().green().write("✓ Wrote " + res.length + " objects to DB.\n");
      cb(null, res.length);
    });
  }
]);

