#! /usr/bin/env node

var changed = require('..');

var resource = new changed.Resource('http://www.example.com', {
  compare: function (current, previous) {
    return (current.length !== previous.length);
  }
});

resource.on('changed', function (current, previous) {
  console.log('Response body changed. Length was ' + previous.length + ', is ' + current.length + '.');
}); 

resource.on('error', function (error) {
  console.error(error.message);
});

resource.startPolling(5000);