class User {
  constructor(socket) {
    this._id = socket.id;
    this._socket = socket;
    this._files = [];
  }
  
  get id() {
    return this._id;
  }

  get files() {
    return this._files;
  }

  emit(message, data = null) {
    return this._socket.emit(message, data);
  }

  addFile(file) {
    this._files.push(file);
  }
}

module.exports = User;