var request = require('request');
var fs = require('fs');

request('http://www.nyintergroup.org/meetinglist/meetinglist.cfm?zone=02&borough=M', function (err, res, body) {
  if (!err && res.statusCode == 200) {
    fs.writeFileSync('./res.txt', body);
  }
  else {console.err('request failed')}
});
