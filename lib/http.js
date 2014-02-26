var http = require('http');
var https = require('https');
var zlib = require('zlib');
var url = require('url');
var _ = require('lodash');

/**
 * GET a HTTP/HTTPS resource. Supports transparent gzip decoding and proxy
 * servers set using the `http_proxy` and `https_proxy` environment variables.
 * @param {string} uri
 * @param {object} options - supports standard http(s).request options
 * @param {function} cb
 */
module.exports.get = function (uri, options, cb) {
  var gunzip = zlib.createUnzip();
  var parsedUri = url.parse(uri);
  var isHttps = parsedUri.protocol === 'https:';
  var proxy = isHttps ? process.env.https_proxy : process.env.http_proxy;
  var requestOptions = parsedUri;
  var parsedProxy;

  if (proxy) {
    parsedProxy = url.parse(proxy);
    isHttps = parsedProxy.protocol === 'https:';
    requestOptions = parsedProxy;
    requestOptions.path = '/' + uri;
  }

  requestOptions = _.merge(requestOptions, options);

  var req = (isHttps ? https : http).get(requestOptions, function (res) {
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
      cb(null, body, res);
    });
  });

  req.on('error', function (error) {
    cb(new Error('Request for ' + uri + ' failed: ' + error.message));
  });

  req.end();
};