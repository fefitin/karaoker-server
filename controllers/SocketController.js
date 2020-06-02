const debug = require('debug')('karaoker:ServerController');
const urlJoin = require('url-join');
const KaraokerController = require('./KaraokerController');
const User = require('./../classes/User');
const Messages = require('./../utils/Messages');

const SocketController = {

  serverURL: null,

  handle: socket => {
    const user = new User(socket);
    debug('User %s connected', user.id);

    socket.on(Messages.DOWNLOAD, url => SocketController.download(user, url));
    socket.on('disconnect', () => SocketController.disconnect(user));
  },

  download: (user, url) => {
    KaraokerController
      .download(url)
      .then(data => {
        user.emit(Messages.DOWNLOAD_OK, data.id);
        return data.file;
      })
      .then(file => KaraokerController.process(file))
      .then(file => {
        user.addFile(file);
        user.emit(Messages.FILE, urlJoin(SocketController.serverURL, file));
      })
      .catch(err => {
        user.emit(Messages.DOWNLOAD_ERROR, err);
      })
  },

  disconnect: user => {
    debug('User %s disconnected', user.id);
    KaraokerController.cleanup(user.files);
  }

};

module.exports = SocketController;