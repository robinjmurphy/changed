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
  this.logger = module.exports.logger || console;
}

util.inherits(Resource, EventEmitter);

/**
 * Start polling the resource for changes.
 * @param {number} interval - polling interval in milliseconds (default 10000)
 */
 Resource.prototype.startPolling = function (interval) {
  var changed = this;
  
  interval = interval || DEFAULT_INTERVAL;

  this.update();

  this._interval = setInterval(function () {
    changed.update();
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
  var changed = this;
  var compare = this.options.compare;
  var previous = this.current;

  compare = compare || function (current, previous) {
    return current !== previous; 
  };

  this.logger.info('Fetching resource: ' + this.url);

  http.get(this.url, this.options, function (err, body) {
    if (err) return changed.emit('error', err);

    if (previous && (compare(body, previous) === true)) {
      changed.emit('changed', body, previous);
    }

    changed.current = body;

    if (cb) {
      cb();
    }
  });
};

/**
 * Expose `Resource`.
 */
module.exports.Resource = Resource;