const nock = require('nock');
const util = require('util');
const sinon = require('sinon');
const net = require('net');
const SmartPlug = require('../smart_plug');
const EventEmitter = require('events').EventEmitter;
const TPLinkProtocol = require('../tp_link_protocol');

function MockSocket() {
  this.connect = function(port, host, callback) {
    console.log("mock connect");
  };
  this.write = function(msg, encoding, callback) {
    console.log("mock write");
    callback();
  };
}
util.inherits(MockSocket, EventEmitter);

describe('SmartPlug', () => {

  describe('#alias', () => {

    var mockSocket;

    beforeEach(() => {
      mockSocket = new MockSocket();
      sinon.stub(net, 'Socket', function() {
        return mockSocket;
      });
    });

    afterEach(() => {
      sinon.restore(net.Socket);
    });

    it('should return the alias of the device', (done) => {
      var device = new SmartPlug("127.0.0.1", 9999);

      device.alias().then((alias) => {
          expect(alias).toBe("Mock Device");
          done();
      });

      var response = {"system":{"get_sysinfo":{"alias": "Mock Device"}}};
      mockSocket.emit('data', TPLinkProtocol.encrypt(JSON.stringify(response)));
    });

  });

});
