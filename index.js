var util = require('util');
var http = require('./lib/http');
var EventEmitter = require('events').EventEmitter;

var DEFAULT_INTERVAL = 10000;

/**
 * @constructor
 * @param {string} url
 * @param {number} interval - polling interval in milliseconds (default 10000)
 * @param {object} options
 * @param {function} options.compare - custom comparison function, recieves current and previous response bodies
 */
function Changed(url, interval, options) {
  this.url = url;
  this.interval = interval || DEFAULT_INTERVAL;
  this.options = options || {};
}

util.inherits(Changed, EventEmitter);

/**
 * Start polling the resource.
 */
Changed.prototype.startPolling = function () {
  var changed = this;

  this.tick();

  this._interval = setInterval(function () {
    changed.tick();
  }, this.interval);
};

/**
 * Start polling the resource.
 */
Changed.prototype.stopPolling = function () {
  clearInterval(this._interval);
};

/**
 * GET the resource and fire a `changed` event if the
 * contents have changed.
 * @param {function} - optional callback for testing
 */
Changed.prototype.tick = function (cb) {
  var changed = this;
  var compare = this.options.compare;
  var previous = this.current;

  compare = compare || function (current, previous) {
    return current !== previous; 
  };

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
 * Expost `Changed` constructor.
 */
module.exports = Changed;