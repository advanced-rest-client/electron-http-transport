const {RedirectsServer} = require('./test/redirects-server');
const server = new RedirectsServer();
server.startServer()
.then((result) => {
  console.log('HTTP:', result[0]);
  console.log('SSL:', result[1]);
});
