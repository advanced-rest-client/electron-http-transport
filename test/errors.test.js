const {ErrorServer} = require('./error-server');
const {DomHelper} = require('./dom-helper');
const assert = require('chai').assert;

describe('Errors', function() {
  let server;
  let port;
  let sslPort;
  before(() => {
    server = new ErrorServer();
    return server.startServer()
    .then((result) => {
      port = result[0];
      sslPort = result[1];
    })
    .then(() => DomHelper.injectElement());
  });

  let _lastId = 0;
  function getRequestId() {
    return (++_lastId);
  }

  describe('Server error codes', function() {
    beforeEach(() => DomHelper.addElement());
    afterEach(() => DomHelper.removeElement());

    it('Handles 5.x.x error', function(done) {
      const url = `http://127.0.0.1:${port}/server`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isFalse(data.isError);
        assert.equal(data.response.status, 500);
        assert.ok(data.response.payload);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId
      });
    });
  });

  describe('Client error codes', function() {
    beforeEach(() => DomHelper.addElement());
    afterEach(() => DomHelper.removeElement());

    it('Handles 4.x.x error', function(done) {
      const url = `http://127.0.0.1:${port}/client`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isFalse(data.isError);
        assert.equal(data.response.status, 400);
        assert.ok(data.response.payload);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId
      });
    });
  });

  describe('Other errors', function() {
    beforeEach(() => DomHelper.addElement());
    afterEach(() => DomHelper.removeElement());

    it('Unexpected hang up', function(done) {
      const url = `http://127.0.0.1:${port}/hungup`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isTrue(data.isError);
        assert.isFalse(data.isXhr);
        assert.ok(data.request);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId
      });
    });
  });
});
