#! /usr/bin/env node

var Changed = require('..');

var resource = new Changed('http://www.example.com', 5000, {
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

resource.startPolling();