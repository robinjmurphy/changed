var assert = require('assert');
var nock = require('nock');
var Changed = require('..');

describe('changed', function () {
  var resource;

  beforeEach(function () {
    resource = new Changed('http://www.example.com');
  });

  describe('.tick', function () {

    it('fires a changed event when the response body has changed', function (done) {
      nock('http://www.example.com').get('/').reply(200, 'Hello');

      resource.tick(function () {
        nock('http://www.example.com').get('/').reply(200, 'Hello World');
        resource.tick();
      });

      resource.on('changed', function (current, previous) {
        assert.equal(current, 'Hello World');
        assert.equal(previous, 'Hello');
        done();
      });
    });

    it('fires an error event when the response code is not 200', function (done) {
      nock('http://www.example.com').get('/').reply(404, 'Not found');

      resource.tick();

      resource.on('error', function (error) {
        assert.equal(error.message, 'Request for http://www.example.com failed with status code: 404');
        done();
      });
    });

    it('fires an error event when the response code is not 200', function (done) {
      nock('http://www.example.com').get('/').reply(404, 'Not found');

      resource.tick();

      resource.on('error', function (error) {
        assert.equal(error.message, 'Request for http://www.example.com failed with status code: 404');
        done();
      });
    });

    describe('when a custom compare function is used', function () {

      beforeEach(function () {
        resource = new Changed('http://www.example.com', 5000, {
          compare: function (current, previous) {
            return (JSON.parse(current).a !== JSON.parse(previous).a);
          }
        });
      });

      describe('when the custom compare function returns true', function () {
        it('fires a changed event', function (done) {
          var eventFired = false;

          nock('http://www.example.com').get('/').reply(200, '{"a": "b", "c": "d"}');

          resource.tick(function () {
            nock('http://www.example.com').get('/').reply(200, '{"a": "z", "c": "d"}');
            resource.tick();
          });

          resource.on('changed', function (current, previous) {
            done();
          });
        });
      });

      describe('when the custom compare function returns false', function () {
        it('does not fire a changed event', function (done) {
          var eventFired = false;

          resource.on('changed', function (current, previous) {
            eventFired = true;
          });
          
          nock('http://www.example.com').get('/').reply(200, '{"a": "b", "c": "d"}');

          resource.tick(function () {
            nock('http://www.example.com').get('/').reply(200, '{"a": "b", "c": "e"}');
            resource.tick(function () {
              assert.equal(false, eventFired, 'changed event should not have fired');
              done();
            });
          });
        });
      });

    });

  });

});