'use strict';

var net = require('net');
const TPLinkProtocol = require('./tp_link_protocol');

function SmartPlug(host, port) {
    this.host = host;
    this.port = port;
    this.alias = undefined;
    this.relayState = undefined;
    this.socket = new net.Socket();
}

SmartPlug.prototype.disconnect = function() {
  this.socket.destroy();
};

SmartPlug.prototype.update = function(callback) {
  this.fetchSysInfo((data) => {
    this.alias = data["alias"];
    this.relayState = data["relay_state"];
    callback();
  });
};

SmartPlug.prototype.fetchSysInfo = function(callback) {
  this.sendRequest("system", "get_sysinfo", {}, (data) => {
    callback(data);
  });
};

SmartPlug.prototype.setRelayState = function(state, callback) {
  this.sendRequest("system", "set_relay_state", {"state": state ? 1 : 0}, null);
  setTimeout(() => {
    this.update(() => {
      if (callback) {
        callback();
      }
    });
  }, 500);
};

SmartPlug.prototype.turnOn = function(callback) {
  this.setRelayState(1, callback);
};

SmartPlug.prototype.turnOff = function(callback) {
  this.setRelayState(0, callback);
};

SmartPlug.prototype.sendRequest = function(target, command, args = {}, callback = null) {
  this.socket.connect(this.port, this.host);
  var request = {};
  request[target] = {};
  request[target][command] = args;
  this.socket.write(TPLinkProtocol.encrypt(JSON.stringify(request)), 'utf8', () => {
      this.listenForResponse(target, command, callback);
  });
};

SmartPlug.prototype.listenForResponse = function(target, command, callback) {
  if (!callback) {
    this.socket.destroy();
    return
  }
  this.socket.on('data', (data) => {
    this.socket.removeAllListeners('data');
    this.socket.destroy();
    var response = JSON.parse(TPLinkProtocol.decrypt(data));
    var data = response[target][command];
    callback(data);
  });
}

module.exports = SmartPlug;
