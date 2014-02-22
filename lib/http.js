var http = require('http');
var https = require('https');
var zlib = require('zlib');
var url = require('url');
var _ = require('lodash');

/**
 * GET a HTTP/HTTPS resource. Supports transparent gzip decoding.
 * @param {string} uri
 * @param {object} options - supports standard http(s).request options
 * @param {function} cb
 */
module.exports.get = function (uri, options, cb) {
  var gunzip = zlib.createUnzip();
  var httpModule = /^https/.test(uri) ? https : http;

  options = _.merge(url.parse(uri), options);

  var req = httpModule.get(options, function (res) {
    var body = '';
    var stream = res;

    if (res.statusCode !== 200) {
      return cb(new Error('Request for ' + uri + ' failed with status code: ' + res.statusCode));
    }

    if (/gzip/.test(res.headers['content-encoding'])) {
      stream = res.pipe(gunzip);
    }

    stream.on('data', function (data) {
      body += data.toString();
    });

    stream.on('end', function () {
      cb(null, body);
    });
  });

  req.on('error', function (error) {
    cb(new Error('Request for ' + uri + ' failed: ' + error.message));
  });

  req.end();
};