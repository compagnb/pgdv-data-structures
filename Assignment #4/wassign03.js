var request = require("request");
var fs = require("fs");

var MongoClient = require("mongodb").MongoClient;
var meetings = JSON.parse(fs.readFileSync("resLatLong.json"));

if(!process.env.IP) { process.env.IP = "127.0.0.1" }

var url = "mongodb://" + process.env.IP + ":27017/meetings";

MongoClient.connect(url, function(err, db) {
  if (err) {return console.dir(err);}

  var collection = db.collection("meetings");

  for (var i=0; i < meetings.length; i++) {
    collection.insert(meetings[i]);
  }
  db.close();

});

