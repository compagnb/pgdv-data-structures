var fs = require('fs');
var cheerio = require('cheerio');

var $ = cheerio.load(fs.readFileSync('./res.html'));

// Selector works since it's the only table nested 3 levels deep.
$("table table table tbody").children("tr").each(function() {

  var curr = $("td:first-child", this);
  var plainText = curr.clone().children().remove().end().text();

  console.log(
    "" 
    // Print Place name
    //+ "\n"
    //+ "Place Name:      " + curr.children("h4").text() + "\n"
    // Print Meeting Motto
    //+ "Meeting Motto:   " + curr.children("b").text() + "\n"
    //
    // Print Meeting Address, removing whitespace and excess spaces
    + plainText.trim().replace(/\s\s+/g, ' ')  
  );

});
