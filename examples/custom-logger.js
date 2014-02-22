#! /usr/bin/env node

var changed = require('..');
var winston = require('winston');

// initialize logging to polloing.log file
winston.add(winston.transports.File, { filename: 'polling.log', json: false });
winston.remove(winston.transports.Console);
changed.logger = winston;

var resource = new changed.Resource('http://www.example.com');

resource.on('changed', function (current, previous) {
  winston.log('Resource changed. Response body was ' + previous + ' , is now ' + current + '.');
}); 

resource.on('error', function (error) {
  winston.error(error.message);
});

resource.startPolling(5000);