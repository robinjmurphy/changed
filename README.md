# changed

[![Build Status](https://travis-ci.org/robinjmurphy/changed.png?branch=master)](https://travis-ci.org/robinjmurphy/changed) [![Code Climate](https://codeclimate.com/github/robinjmurphy/changed.png)](https://codeclimate.com/github/robinjmurphy/changed)

Polls HTTP resources and fires events when they change.

## Features

* Supports HTTP and HTTPS
* Transparently decodes gzipped resources

## Installation

```
npm install robinjmurphy/changed
```

## Usage

```javascript
var changed = require('changed');

var resource = new changed.Resource('http://www.example.com');

resource.on('changed', function (current, previous) {
  console.log('Resource changed. Response body was ' + previous + ' , is now ' + current + '.');
});

resource.startPolling(5000);
```

## API

#### `new changed.Resource(url, options)`

##### Parameters

* `url` - _string_
* `options` - _object_ - configuration options

##### Options

The `options` object supports all of the standard options from [http.request](http://nodejs.org/api/http.html#http_http_request_options_callback) and [https.request](http://nodejs.org/api/https.html#https_https_request_options_callback). In addition, it supports the following properties:

* `compare` - _function_ - overrides the default response body comparison. Receives the current response body as its first argument and the previous response body as its second argument. Should return `true` if the responses differ.

---

#### `.startPolling(interval)`

Start polling the resource for changes.

##### Parameters

* `interval` - _number_ - the interval time in milliseconds (default `10000`)

---

#### `.stopPolling()`

Stop polling the resource.

---

### Events

##### `changed`

Fired when the resource's body changes.

```javascript
resource.on('changed', function (current, previous) {
  // `current` is a string containing the curent response body
  // `previous` is a string containing previous response body 
});
```

##### `error`

Fired when an error occurs.

```javascript
resource.on('error', function (error) {
  // `error` is an Error object
});
```

##### `response`

Fired each time a response is received whilst polling.

```javascript
resource.on('response', function (body, res) {
  // `body` is a string containig the response body
  // `res` is the http/https response object
});
```

## Logging

All polling requests are logged using `console.info` by default. To use a custom logger, like [Winston](https://github.com/flatiron/winston), just set the `changed.logger` property:

```javascript
var changed = require('changed');
var winston = require('winston');

changed.logger = winston;
```

## Examples

### Custom response comparison

In the following example the `changed` event is only fired when the `foo` property in a JSON response changes.

```javascript
var changed = require('changed');

var resource = new changed.Resource('http://www.example.com/some/json/file.json', {
  compare: function (current, previous) {
    var currentJson = JSON.parse(current);
    var previousJson = JSON.parse(previous);
    
    return (currentJson.foo !== previousJson.foo);
  }
});

resource.startPolling(5000);
```