"use strict";

var dgram = require('dgram');
const TPLinkProtocol = require('./tp_link_protocol');

function SmartPlugExplorer(host = "255.255.255.255", port = 9999, timeout = 5000, listenPort = null) {
  this.host = host;
  this.port = port;
  this.listenPort = listenPort;
  this.timeout = timeout;
  this.devices = [];

  this.client = dgram.createSocket("udp4");

  this.client.on('message', (msg, rinfo) => {
    var response = JSON.parse(TPLinkProtocol.decrypt(msg, false));
    var sysInfo = response["system"]["get_sysinfo"];
    console.log(`- Found device at ${rinfo.address}:${rinfo.port} - ${JSON.stringify(sysInfo)}`);
    this.devices.push({ ip: rinfo.address, port: rinfo.port, info: sysInfo });
  });

  this.client.on('error', (error) => {
    console.log("Socket error:", error);
    this.client.close();
  });

  this.client.on('listening', () => {
    var address = this.client.address();
    console.log(`Listening for messages on ${address.address}:${address.port}`);
  });

  this.client.on('close', () => {
    console.log("Socket closed");
  });
}

SmartPlugExplorer.prototype.findDevices = function(callback) {
  this.devices = [];

  this.client.bind({port: this.listenPort}, () => {
      this.client.setBroadcast(true);

      console.log(`Sending device discovery broadcast to ${this.host}:${this.port}`);
      var request = TPLinkProtocol.encrypt(JSON.stringify({"system": {"get_sysinfo": {}}}, false));
      this.client.send(request, 0, request.length, this.port, this.host);

      setTimeout(_ => {
          this.client.close();
          if (callback) {
            callback(this.devices);
          }
      }, this.timeout);
  });
}

module.exports = SmartPlugExplorer;
