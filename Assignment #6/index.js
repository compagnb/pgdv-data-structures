var request       = require("request");
var async         = require("async");
var fs            = require("fs");
var cheerio       = require("cheerio");
var MongoClient   = require("mongodb").MongoClient;
var getMeetingsFromPage = require("./getMeetingsFromPage.js");

if(!process.env.IP) { process.env.IP = "127.0.0.1" }

var meetings = [];

const url = "mongodb://" + process.env.IP + ":27017/meetings";
const meetingsUrl = 'http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=02&borough=M';

async.waterfall([
  (cb) => {
    request(meetingsUrl, function (err, res, body) {
      if(err) cb(err);
      cb(null, body);
    });
  },
  (body, cb) => getMeetingsFromPage(body, cb),
  (res, cb) => {
    MongoClient.connect(url, function(err, db) {
      if (err) {return console.dir(err);}
      db.collection("meetings").insert(res);
      db.close();
      cb(null, res.length);
    });
  }
], (err, res) => console.log("wrote " + res + " entries to DB"));

