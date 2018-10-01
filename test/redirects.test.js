const {RedirectsServer} = require('./redirects-server');
const {DomHelper} = require('./dom-helper');
const assert = require('chai').assert;

describe('Redirects', function() {
  let server;
  let port;
  let sslPort;
  before(() => {
    server = new RedirectsServer();
    return server.startServer()
    .then((result) => {
      port = result[0];
      sslPort = result[1];
    })
    .then(() => DomHelper.injectElement());
  });

  function assertRedirectStructure(redirect) {
    assert.typeOf(redirect.headers, 'string', 'Has redirect headers');
    assert.notEqual(redirect.headers.toLowerCase().indexOf('location:'), -1,
      'Headers has location');
    assert.typeOf(redirect.url, 'string', 'url is set');
    assert.typeOf(redirect.sentHttpMessage, 'string', 'sentHttpMessage is set');
    assert.typeOf(redirect.status, 'number', 'status is set');
    assert.typeOf(redirect.statusText, 'string', 'sentHttpMessage is set');
    assert.typeOf(redirect.url, 'string', 'url is set');
    assert.isUndefined(redirect.stats);
  }

  function assertTimingsStructure(stats) {
    assert.typeOf(stats.connect, 'number', 'connect is set');
    assert.typeOf(stats.receive, 'number', 'receive is set');
    assert.typeOf(stats.send, 'number', 'send is set');
    assert.typeOf(stats.wait, 'number', 'wait is set');
    assert.typeOf(stats.ssl, 'number', 'ssl is set');
    assert.typeOf(stats.dns, 'number', 'ssl is set');
    assert.isUndefined(stats.firstReceived);
    assert.isUndefined(stats.lastReceived);
    assert.isUndefined(stats.messageSendStart);
    assert.isUndefined(stats.waitingStart);
  }

  let _lastId = 0;
  function getRequestId() {
    return (++_lastId);
  }

  describe('Single redirect', function() {
    beforeEach(() => DomHelper.addElement());
    afterEach(() => DomHelper.removeElement());
    it('Makes absolute redirect - http', function(done) {
      const url = `http://127.0.0.1:${port}/single-absolute-redirect`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isFalse(data.isError);
        assert.typeOf(data.redirects, 'array');
        assert.lengthOf(data.redirects, 1);
        assert.typeOf(data.redirectsTiming, 'array');
        assert.lengthOf(data.redirectsTiming, 1);
        assertRedirectStructure(data.redirects[0]);
        assertTimingsStructure(data.redirectsTiming[0]);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          followRedirects: true
        }
      });
    });

    it('Makes absolute redirect - https', function(done) {
      const url = `https://127.0.0.1:${sslPort}/single-absolute-redirect`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isFalse(data.isError);
        assert.typeOf(data.redirects, 'array');
        assert.lengthOf(data.redirects, 1);
        assert.typeOf(data.redirectsTiming, 'array');
        assert.lengthOf(data.redirectsTiming, 1);
        assertRedirectStructure(data.redirects[0]);
        assertTimingsStructure(data.redirectsTiming[0]);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          followRedirects: true
        }
      });
    });

    it('Dispatches "before-redirect" custom event', function(done) {
      const url = `http://127.0.0.1:${port}/single-absolute-redirect`;
      let redirectUrl;
      const requestId = getRequestId();
      window.addEventListener('before-redirect', function fb(e) {
        if (e.detail.id !== requestId) {
          return;
        }
        window.removeEventListener('before-redirect', fb);
        assert.equal(e.detail.id, requestId, 'Has request ID');
        assert.typeOf(e.detail.url, 'string', 'Has redirect url');
        redirectUrl = e.detail.url;
      });
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== requestId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.typeOf(redirectUrl, 'string', 'Event was called');
        assert.equal(data.request.url, redirectUrl, 'request url is a redirect url');
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: requestId,
        config: {
          followRedirects: true
        }
      });
    });

    it('Cancelled "before-redirect" cancels redirect', function(done) {
      const url = `http://127.0.0.1:${port}/single-absolute-redirect`;
      const requestId = getRequestId();
      window.addEventListener('before-redirect', function fb(e) {
        if (e.detail.id !== requestId) {
          return;
        }
        window.removeEventListener('before-redirect', fb);
        e.preventDefault();
      });
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== requestId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isUndefined(data.redirects);
        assert.isUndefined(data.redirectsTiming);
        assert.equal(data.response.status, 301);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: requestId,
        config: {
          followRedirects: true
        }
      });
    });

    it('followRedirects option stops redirects', function(done) {
      const url = `http://127.0.0.1:${port}/single-absolute-redirect`;
      const requestId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== requestId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isUndefined(data.redirects);
        assert.isUndefined(data.redirectsTiming);
        assert.equal(data.response.status, 301);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: requestId,
        config: {
          followRedirects: false
        }
      });
    });

    it('Makes relative redirect - http', function(done) {
      const url = `http://127.0.0.1:${port}/single-relative-redirect`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isFalse(data.isError);
        assert.typeOf(data.redirects, 'array');
        assert.lengthOf(data.redirects, 1);
        assert.typeOf(data.redirectsTiming, 'array');
        assert.lengthOf(data.redirectsTiming, 1);
        assertRedirectStructure(data.redirects[0]);
        assertTimingsStructure(data.redirectsTiming[0]);
        assert.notEqual(data.redirects[0].headers.indexOf('Location: /redirect-target'), -1);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          followRedirects: true
        }
      });
    });
  });

  describe('Prohibits redirect loops', function() {
    beforeEach(() => DomHelper.addElement());
    afterEach(() => DomHelper.removeElement());

    it('Will not redirect to the same url', function(done) {
      const url = `http://127.0.0.1:${port}/loop`;
      const requestId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== requestId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isTrue(data.isError);
        assert.ok(data.error);
        assert.ok(data.request);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: requestId,
        config: {
          followRedirects: true
        }
      });
    });
  });

  describe('Multiple redirects', function() {
    beforeEach(() => DomHelper.addElement());
    afterEach(() => DomHelper.removeElement());
    it('Makes absolute redirect - http', function(done) {
      const url = `http://127.0.0.1:${port}/multiple?index=3`;
      const rId = getRequestId();
      window.addEventListener('report-response', function f(e) {
        if (e.detail.id !== rId) {
          return;
        }
        window.removeEventListener('report-response', f);
        const data = e.detail;
        assert.isFalse(data.isError);
        assert.typeOf(data.redirects, 'array');
        assert.lengthOf(data.redirects, 4);
        assert.typeOf(data.redirectsTiming, 'array');
        assert.lengthOf(data.redirectsTiming, 4);
        assertRedirectStructure(data.redirects[0]);
        assertTimingsStructure(data.redirectsTiming[0]);
        assertRedirectStructure(data.redirects[3]);
        assertTimingsStructure(data.redirectsTiming[3]);
        done();
      });
      DomHelper.fire({
        url: url,
        method: 'GET',
        id: rId,
        config: {
          followRedirects: true
        }
      });
    });
  });
});
