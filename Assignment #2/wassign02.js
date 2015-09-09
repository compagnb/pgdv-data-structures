var fs = require('fs');
var cheerio = require('cheerio');

var content = fs.readFileSync('./res.html');

var $ = cheerio.load(content);

var trs = $("table table table tbody").children("tr").each(function() {
  var curr = $("td:first-child", this);
  var plainText = curr.clone().children().remove().end().text();

  console.log(
    "\n" 
    + "Place Name:      " + curr.children("h4").text() + "\n"
    + "Meeting Motto:   " + curr.children("b").text() + "\n"
    + "Address:         " + plainText.trim().replace("\n","").replace( /  +/g, ' ' ).replace(/\s\s+/g, ' ')  );

});
