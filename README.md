# changed

[![Build Status](https://travis-ci.org/robinjmurphy/changed.png?branch=master)](https://travis-ci.org/robinjmurphy/changed) [![Code Climate](https://codeclimate.com/github/robinjmurphy/changed.png)](https://codeclimate.com/github/robinjmurphy/changed)

Polls HTTP resources and fires events when they change.

## Features

* Supports HTTP and HTTPS
* Transparently decodes gzipped resources

## Installation

```
npm install --save robinjmurphy/changed
```

## Usage

```javascript
var changed = require('changed');

var resource = new changed.Resource('http://www.example.com', 5000);

resource.on('changed', function (current, previous) {
  console.log('Resource changed. Response body was ' + previous + ' , is now' + current + '.');
});

resource.startPolling();
```

## API

#### `new changed.Resource(url, interval, options)`

##### Parameters

* `url` - _string_
* `interval` - _number_ - the interval time in milliseconds (default `10000`)
* `options` - _object_ - configuration options

##### Options

The `options` object supports all of the standard options from [http.request](http://nodejs.org/api/http.html#http_http_request_options_callback) and [https.request](http://nodejs.org/api/https.html#https_https_request_options_callback). In addition, it supports the following properties:

* `compare` - _function_ - overrides the default respone body comparison. Receives the current response body as its first argument and the previous response body as its second argument. Should return `true` if the response bodies differ.


#### `.startPolling()`

Start polling the resource.

#### `.stopPolling()`

Stop polling the resource.


### Events

#### `changed`

Fired when the resource's body changes.

```javascript
resource.on('changed', function (current, previous) {
  // `current` is a string containing the curent response body
  // `previous` is a string containing previous response body 
});
```

#### `error`

Fired when an error occurs.

```javascript
resource.on('error', function (error) {
  // `error` is an Error object
});
```

## Examples

### Custom response comparison

In the following example the `changed` event is only fired when the `someProperty` property in a JSON response changes.

```javascript
var Changed = require('changed');

var resource = new Changed('http://www.example.com/some/json/file.json', 5000, {
  compare: function (current, previous) {
    var currentJson = JSON.parse(current);
    var previousJson = JSON.parse(previous);
    
    return (currentJson.someProperty !== previousJson.someProperty);
  }
});
```