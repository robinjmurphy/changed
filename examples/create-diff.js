#! /usr/bin/env node

var changed = require('..');
var diff = require('diff');
var fs = require('fs');

var resource = new changed.Resource('http://www.bbc.co.uk');

resource.on('changed', function (current, previous) {
  var ts = ((new Date()).getTime() / 1000).toFixed(); 
  var filename = 'bbc_co_uk_' + ts +'.diff';
  fs.writeFileSync(filename, diff.createPatch(resource.url, previous, current));
}); 

resource.on('error', function (error) {
  console.error(error.message);
});

resource.startPolling(5000);