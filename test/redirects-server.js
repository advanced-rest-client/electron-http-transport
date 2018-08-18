const {TestBaseServer} = require('./base-test-server');
const url = require('url');

class RedirectsServer extends TestBaseServer {
  _handleRequest(req, res) {
    if (req.method === 'GET' && req.url.indexOf('/single-absolute-redirect') === 0) {
      this._handleSingleRedirect(res, {
        absolute: true,
        server: req.client.server
      });
      return;
    }

    if (req.method === 'GET' && req.url.indexOf('/single-relative-redirect') === 0) {
      this._handleSingleRedirect(res, {
        absolute: false,
        server: req.client.server
      });
      return;
    }

    if (req.method === 'GET' && req.url.indexOf('/multiple') === 0) {
      this._multipleRedirects(req, res);
      return;
    }

    if (req.method === 'GET' && req.url.indexOf('/redirect-target') === 0) {
      this._handleRedirectTarget(res);
      return;
    }

    if (req.method === 'GET' && req.url.indexOf('/loop') === 0) {
      this._handleLoop(req, res);
      return;
    }
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.write(`URL ${req.url} not handled`);
    res.end();
  }

  _redirectBase(server, absolute) {
    let url;
    if (absolute) {
      const addr = server.address();
      const host = addr.address;
      const port = addr.port;
      url = 'http';
      if (this.sslInfo.port === port) {
        url += 's';
      }
      url += `://${host}:${port}`;
    } else {
      url = '';
    }
    return url;
  }

  _handleSingleRedirect(res, opts) {
    if (!opts) {
      opts = {};
    }
    let url = this._redirectBase(opts.server, opts.absolute);
    url += '/redirect-target';
    res.writeHead(301, {
      'Location': url
    });
    res.end();
  }

  _handleRedirectTarget(res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    const body = JSON.stringify({
      success: true
    }, null, 2);
    res.write(body);
    res.end();
  }

  _handleLoop(req, res) {
    if (!this._lopIndex) {
      this._lopIndex = 0;
    }
    this._lopIndex++;
    if (this._lopIndex === 10) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      const body = JSON.stringify({
        success: false
      }, null, 2);
      res.write(body);
      res.end();
    } else {
      let url = this._redirectBase(req.client.server, true);
      url += '/loop';
      res.writeHead(301, {
        'Location': url
      });
      res.end();
    }
  }

  _multipleRedirects(req, res) {
    const qp = url.parse(req.url, true);
    let base = this._redirectBase(req.client.server, true);
    let id = qp.query.index ? Number(qp.query.index) : 0;
    if (id === 0) {
      base += '/redirect-target';
    } else {
      id--;
      base += '/multiple?index=' + id;
    }
    res.writeHead(301, {
      'Location': base
    });
    res.end();
  }
}
module.exports.RedirectsServer = RedirectsServer;
