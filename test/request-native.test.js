const {DataServer} = require('./data-server');
const {DomHelper} = require('./dom-helper');
const assert = require('chai').assert;

describe('Native request tests', function() {
  let server;
  let port;
  before(() => {
    server = new DataServer();
    return server.startServer()
    .then((result) => {
      port = result[0];
    })
    .then(() => DomHelper.injectElement());
  });

  let _lastId = 0;
  function getRequestId() {
    return (++_lastId);
  }

  describe('Getting data', function() {
    beforeEach(() => DomHelper.addElement());
    afterEach(() => DomHelper.removeElement());

    it('Reads request over http', function(done) {
      const url = `http://127.0.0.1:${port}/json`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.ok(data.response);
        assert.ok(data.request);
        assert.isFalse(data.isError);
        assert.isFalse(data.isXhr);
        assert.typeOf(data.loadingTime, 'number');
        assert.typeOf(data.sentHttpMessage, 'string');
        assert.typeOf(data.timing, 'object');
        const resp = data.response;
        assert.typeOf(resp.headers, 'string');
        assert.typeOf(resp.statusText, 'string');
        assert.typeOf(resp.url, 'string');
        assert.ok(resp.payload);
        assert.equal(resp.status, 200);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          nativeTransport: true
        }
      });
    });

    it('Reads request over SSL', function(done) {
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.ok(data.response);
        assert.ok(data.request);
        assert.isFalse(data.isError);
        assert.isFalse(data.isXhr);
        assert.typeOf(data.loadingTime, 'number');
        assert.typeOf(data.sentHttpMessage, 'string');
        assert.typeOf(data.timing, 'object');
        const resp = data.response;
        assert.typeOf(resp.headers, 'string');
        assert.typeOf(resp.statusText, 'string');
        assert.typeOf(resp.url, 'string');
        assert.ok(resp.payload);
        assert.equal(resp.status, 200);
        done();
      });
      DomHelper.fire({
        url: 'https://www.google.com',
        method: 'GET',
        id: rId,
        config: {
          nativeTransport: true
        }
      });
    });

    it('Reads text data', function(done) {
      const url = `http://127.0.0.1:${port}/text`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.equal(data.response.payload.toString(), 'test-response');
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          nativeTransport: true
        }
      });
    });

    it('Reads binnary data', function(done) {
      const url = `http://127.0.0.1:${port}/binnary`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isAbove(data.response.payload.length, 500);
        assert.isAbove(data.response.headers.indexOf('image/jpg'), 0);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          nativeTransport: true
        }
      });
    });

    it('Reads headers data', function(done) {
      const url = `http://127.0.0.1:${port}/headers`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.notEqual(data.response.headers.indexOf('x-header-1: test-value'), -1);
        assert.notEqual(data.response.headers.indexOf('server: test.com'), -1);
        assert.notEqual(data.response.headers.indexOf('cache-control: no-cache'), -1);
        assert.notEqual(data.response.headers.indexOf('set-cookie: c=v'), -1);
        assert.notEqual(data.response.headers.indexOf('x-frame-options: deny'), -1);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          nativeTransport: true
        }
      });
    });
  });
});
