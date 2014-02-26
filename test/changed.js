var assert = require('assert');
var nock = require('nock');
var sinon = require('sinon');
var changed = require('..');

describe('changed', function () {

  describe('Resource', function () {

    var resource;
    var logger;

    beforeEach(function () {
      logger = {
        info: sinon.spy()
      };
      changed.logger = logger;
      changed.proxy = null;
      resource = new changed.Resource('http://www.example.com');
    });

    afterEach(function () {
      delete process.env.http_proxy;
      delete process.env.https_proxy;
    });

    describe('.update', function () {

      it('fires a response event when a response is received', function (done) {
        nock('http://www.example.com').get('/').reply(200, 'Hello World');

        resource.on('response', function (body) {
          assert.equal(body, 'Hello World');
          done();
        });
        
        resource.update();
      });

      it('fires a changed event when the response body has changed', function (done) {
        nock('http://www.example.com').get('/').reply(200, 'Hello');

        resource.update(function () {
          nock('http://www.example.com').get('/').reply(200, 'Hello World');
          resource.update();
        });

        resource.on('changed', function (current, previous) {
          assert.equal(current, 'Hello World');
          assert.equal(previous, 'Hello');
          done();
        });
      });

      it('fires an error event when the response code is not 200', function (done) {
        nock('http://www.example.com').get('/').reply(404, 'Not found');

        resource.update();

        resource.on('error', function (error) {
          assert.equal(error.message, 'Request for http://www.example.com failed with status code: 404');
          done();
        });
      });

      it('logs requests', function (done) {
        nock('http://www.example.com').get('/').reply(200);

        resource.update(function () {
          assert.ok(logger.info.calledWith('Fetching resource: http://www.example.com'));
          done();
        });
      });

      it('uses the http_proxy environment variable for requests when it is set', function () {
        var proxyRequest = nock('http://proxy.com:8080').get('/http://www.example.com').reply(200);

        process.env.http_proxy = 'http://proxy.com:8080';

        resource.update();

        proxyRequest.done();
      });

      it('uses the https_proxy environment variable for requests when it is set', function () {
        var proxyRequest = nock('http://proxy.com:8080').get('/https://www.example.com').reply(200);
        
        resource = new changed.Resource('https://www.example.com');
        process.env.https_proxy = 'http://proxy.com:8080';

        resource.update();

        proxyRequest.done();
      });

      describe('when a custom compare function is used', function () {

        beforeEach(function () {
          resource = new changed.Resource('http://www.example.com', {
            compare: function (current, previous) {
              return (JSON.parse(current).a !== JSON.parse(previous).a);
            }
          });
        });

        describe('when the custom compare function returns true', function () {
          it('fires a changed event', function (done) {
            var eventFired = false;

            nock('http://www.example.com').get('/').reply(200, '{"a": "b", "c": "d"}');

            resource.update(function () {
              nock('http://www.example.com').get('/').reply(200, '{"a": "z", "c": "d"}');
              resource.update();
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

            resource.update(function () {
              nock('http://www.example.com').get('/').reply(200, '{"a": "b", "c": "e"}');
              resource.update(function () {
                assert.equal(false, eventFired, 'changed event should not have fired');
                done();
              });
            });
          });
        });

      });

    });

  });

});