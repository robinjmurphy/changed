var util = require('util');
var http = require('./lib/http');
var EventEmitter = require('events').EventEmitter;

var DEFAULT_INTERVAL = 10000;

/**
 * @constructor
 * @param {string} url
 * @param {object} options
 * @param {function} options.compare - custom comparison function, recieves current and previous response bodies
 */
function Resource(url, options) {
  this.url = url;
  this.options = options || {};
  this.logger = module.exports.logger;
}

util.inherits(Resource, EventEmitter);

/**
 * Start polling the resource for changes.
 * @param {number} interval - polling interval in milliseconds (default 10000)
 */
 Resource.prototype.startPolling = function (interval) {
  var resource = this;
  
  interval = interval || DEFAULT_INTERVAL;

  this.update();

  this._interval = setInterval(function () {
    resource.update();
  }, interval);
};

/**
 * Start polling the resource.
 */
 Resource.prototype.stopPolling = function () {
  clearInterval(this._interval);
};

/**
 * GET the resource and fire a `changed` event if the
 * contents have changed.
 * @param {function} - optional callback for testing
 */
 Resource.prototype.update = function (cb) {
  var resource = this;
  var compare = this.options.compare;
  var previous = this.current;

  compare = compare || function (current, previous) {
    return current !== previous; 
  };

  this.logger.info('Fetching resource: ' + this.url);

  http.get(this.url, this.options, function (err, body, res) {
    if (err) return resource.emit('error', err);

    resource.emit('response', body, res);

    if (previous && (compare(body, previous) === true)) {
      resource.emit('changed', body, previous);
    }

    resource.current = body;

    if (cb) {
      cb();
    }
  });
};

/**
 * Expose `Resource`.
 */
module.exports.Resource = Resource;

/**
 * Expose `logger` and set default to `console`
 */
module.exports.logger = console;