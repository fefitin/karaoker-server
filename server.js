require('dotenv').config();
const debug = require('debug')('karaoker:Server');
const urlJoin = require('url-join');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const proxy = require('express-http-proxy');

//Setup controllers
const SocketController = require('./controllers/SocketController');
SocketController.serverURL = urlJoin(process.env.SERVER_URL, process.env.SERVE_DIR);

const KaraokerController = require('./controllers/KaraokerController');
KaraokerController.tmp = process.env.TMP_DIR;
KaraokerController.serve = process.env.SERVE_DIR;

//Filter connections
io.origins([ process.env.ALLOWED_ORIGIN ]);

//Receive new connections
io.on("connection", function(socket) {
  SocketController.handle(socket);
});

//Serve static files
app.use(`/${process.env.SERVE_DIR}`, express.static(process.env.SERVE_DIR));

//Serve frontend for debugging purposes
app.use('/', proxy('localhost:3000'));

//Start server
const port = process.env.PORT;
http.listen(port, () => {
  debug('Listening on port %d', port);
});
