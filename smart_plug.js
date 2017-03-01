'use strict';

var net = require('net');
var $q = require('q');
const TPLinkProtocol = require('./tp_link_protocol');

function SmartPlug(host, port) {
    this.host = host;
    this.port = port;
    this.socket = new net.Socket();
    this.socket.connect(port, host, () => {
	    console.log('Connected');
    });
}

SmartPlug.prototype.alias = function(callback) {
  this.sendRequest("system", "get_sysinfo", {}, (data) => {
    callback(data["alias"]);
  });
};

SmartPlug.prototype.relayState = function(callback) {
  this.sendRequest("system", "get_sysinfo", {}, (data) => {
    callback(data["relay_state"]);
  });
};

SmartPlug.prototype.setRelayState = function(state) {
  this.sendRequest("system", "set_relay_state", {"state": state}, null);
};

SmartPlug.prototype.turnOn = function() {
  this.setRelayState(1);
};

SmartPlug.prototype.turnOff = function() {
  this.setRelayState(0);
};

SmartPlug.prototype.sendRequest = function(target, command, args = {}, callback = null) {
  var request = {};
  request[target] = {};
  request[target][command] = args;
  this.socket.write(TPLinkProtocol.encrypt(JSON.stringify(request)), 'utf8', () => {
    if (callback) {
      this.socket.on('data', (data) => {
        this.socket.removeAllListeners('data');
        var response = JSON.parse(TPLinkProtocol.decrypt(data));
        var data = response[target][command];
        callback(data);
      });
    }
  });
};

module.exports = SmartPlug;
