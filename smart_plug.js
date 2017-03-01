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
  let request = {"system": {"get_sysinfo": {}}};
  this.socket.write(TPLinkProtocol.encrypt(JSON.stringify(request)), 'utf8', () => {
    this.socket.on('data', (data) => {
      var response = JSON.parse(TPLinkProtocol.decrypt(data));
      var alias = response["system"]["get_sysinfo"]["alias"];
      defer.resolve(alias);
    });
  });
  return defer.promise;
};

module.exports = SmartPlug;
