var MongoClient   = require("mongodb").MongoClient;
var ansi          = require('ansi');
var cursor        = ansi(process.stdout);


if(!process.env.IP) { process.env.IP = "127.0.0.1" }

const url = "mongodb://" + process.env.IP + ":27017/meetings";

MongoClient.connect(url, function(err, db) {
  db.collection("meetings").aggregate([
    {$unwind: "$times"},
    {$match: {$or: [
      {$and: [
        {"times.hours.from.hour": {$gte: 7}},
        {"times.day": "Tuesdays"},
        {"times.hours.from.ampm": "PM"}
      ]},
      {$and: [
        {"times.hours.from.hour": 12},
        {"times.day": "Wednesdays"},
        {"times.hours.from.ampm": "AM"}
      ]}
    ]}},
    {$project: {
      "_id": 0, 
      "name": 1, 
      "address": 1, 
      "meetingTimes": {
        $concat: [
          "$times.day", ", ",
          {$substr: ["$times.hours.from.hour", 0, 2]}, ":",
          {
            $cond: {
              "if": {$gt: ["$times.hours.from.minute", 0]}, 
              "then": {$substr: ["$times.hours.from.minute", 0, 2]},
              "else": "00"
            }
          }, 
          "$times.hours.from.ampm",
          " to ", 
          {$substr: ["$times.hours.to.hour", 0, 2]}, ":",
          {
            $cond: {
              "if": {$gt: ["$times.hours.to.minute", 0]}, 
              "then": {$substr: ["$times.hours.to.minute", 0, 2]},
              "else": "00"
            }
          }, 
          "$times.hours.to.ampm"
        ]
      }
    }}
  ], (err, res) => {
    cursor.underline().green().write("✓ " + res.length + " meetings Tuesdays 7pm or later (incl. midnight)\n").reset();
    res.forEach((el) => {
      cursor.write("→ " + el.address + ", " + el.meetingTimes + "\n");
    });
    db.close();
  });
});
