const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

require('ssl-root-cas')
.inject()
.addFile(path.join('test', 'certs', 'ca.cert.pem'));

class TestBaseServer {
  constructor() {
    this.serverInfo = {};
    this.sslInfo = {};
    this.socketMap = {};
    this.lastSocketKey = 0;
    this._handleConnection = this._handleConnection.bind(this);
    this._handleRequest = this._handleRequest.bind(this);
  }

  _handleRequest() {}

  _handleConnection(socket) {
    const socketKey = ++this.lastSocketKey;
    this.socketMap[socketKey] = socket;
    socket.on('close', () => {
      delete this.socketMap[socketKey];
    });
  }

  createServer() {
    return new Promise((resolve) => {
      const server = http.createServer(this._handleRequest);
      server.on('error', (err) => {
        throw err;
      });
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        this.serverInfo.port = port;
        resolve(port);
      });
      server.on('connection', this._handleConnection);
      this.serverInfo.server = server;
    });
  }

  createSsl() {
    return new Promise((resolve) => {
      const options = {
        key: fs.readFileSync(path.join('test', 'certs', 'privkey.pem')),
        cert: fs.readFileSync(path.join('test', 'certs', 'fullchain.pem'))
      };
      const server = https.createServer(options, this._handleRequest);
      server.on('error', (err) => {
        throw err;
      });
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        this.sslInfo.port = port;
        resolve(port);
      });
      server.on('connection', this._handleConnection);
      this.sslInfo.server = server;
    });
  }

  startServer() {
    return Promise.all([
      this.createServer(),
      this.createSsl()
    ]);
  }

  shutdown() {
    Object.keys(this.socketMap).forEach((socketKey) =>
      this.socketMap[socketKey].destroy());
    return Promise.all([
      this.shutdownServer(),
      this.shutdownSsl()
    ]);
  }

  shutdownServer() {
    if (!this.serverInfo.server) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.serverInfo.server.close(() => resolve());
      this.serverInfo = {};
    });
  }

  shutdownSsl() {
    if (!this.sslInfo.server) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.sslInfo.server.close(() => resolve());
      this.sslInfo = {};
    });
  }
}

module.exports.TestBaseServer = TestBaseServer;
