const {TestBaseServer} = require('./base-test-server');
const url = require('url');

class ErrorServer extends TestBaseServer {
  _handleRequest(req, res) {
    if (req.method === 'GET' && req.url.indexOf('/server') === 0) {
      this._handleServerError(req, res);
      return;
    }
    if (req.method === 'GET' && req.url.indexOf('/client') === 0) {
      this._handleClientError(req, res);
      return;
    }
    if (req.method === 'GET' && req.url.indexOf('/hungup') === 0) {
      this._handleHungUp(req, res);
      return;
    }
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.write(`URL ${req.url} not handled`);
    res.end();
  }

  _handleServerError(req, res) {
    const qp = url.parse(req.url, true);
    const status = qp.query.status ? Number(qp.query.status) : 500;
    res.writeHead(status, {'Content-Type': 'application/json'});
    const body = JSON.stringify({
      serverError: true
    }, null, 2);
    res.write(body);
    res.end();
  }

  _handleClientError(req, res) {
    const qp = url.parse(req.url, true);
    const status = qp.query.status ? Number(qp.query.status) : 400;
    res.writeHead(status, {'Content-Type': 'application/json'});
    const body = JSON.stringify({
      serverError: true
    }, null, 2);
    res.write(body);
    res.end();
  }

  _handleHungUp(req) {
    req.socket.destroy();
  }
}
module.exports.ErrorServer = ErrorServer;
