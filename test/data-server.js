const {TestBaseServer} = require('./base-test-server');
const fs = require('fs');

class DataServer extends TestBaseServer {
  _handleRequest(req, res) {
    if (req.method === 'GET' && req.url.indexOf('/json') === 0) {
      this._handleJson(res);
      return;
    }
    if (req.method === 'GET' && req.url.indexOf('/text') === 0) {
      this._handleText(res);
      return;
    }
    if (req.method === 'GET' && req.url.indexOf('/binnary') === 0) {
      this._handleBinary(res);
      return;
    }
    if (req.method === 'GET' && req.url.indexOf('/headers') === 0) {
      this._handleHeaders(res);
      return;
    }
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.write(`URL ${req.url} not handled`);
    res.end();
  }

  _handleJson(res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    const body = JSON.stringify({
      success: true
    }, null, 2);
    res.write(body);
    res.end();
  }

  _handleText(res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('test-response');
    res.end();
  }

  _handleBinary(res) {
    res.writeHead(200, {'content-type': 'image/jpg'});
    fs.createReadStream('./test/test.jpeg').pipe(res);
  }

  _handleHeaders(res) {
    res.writeHead(200, {
      'x-header-1': 'test-value',
      'Server': 'test.com',
      'Cache-Control': 'no-cache',
      'Set-Cookie': 'c=v; path=/; max-age=6000; secure; HttpOnly',
      'X-Frame-Options': 'deny',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block'
    });
    res.end();
  }
}
module.exports.DataServer = DataServer;
