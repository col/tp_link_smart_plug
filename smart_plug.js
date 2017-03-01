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

SmartPlug.prototype.alias = function() {
  var defer = $q.defer();
  this.sendRequest("system", "get_sysinfo", {}, (data) => {
    defer.resolve(data["alias"]);
  });
  return defer.promise;
};

SmartPlug.prototype.sendRequest = function(target, command, args = {}, callback) {
  var request = {};
  request[target] = {};
  request[target][command] = args;
  this.socket.write(TPLinkProtocol.encrypt(JSON.stringify(request)), 'utf8', () => {
    this.socket.on('data', (data) => {
      var response = JSON.parse(TPLinkProtocol.decrypt(data));
      var data = response[target][command];
      callback(data);
    });
  });
};

module.exports = SmartPlug;
