const nock = require('nock');
const util = require('util');
const sinon = require('sinon');
const net = require('net');
const SmartPlug = require('../smart_plug');
const EventEmitter = require('events').EventEmitter;
const TPLinkProtocol = require('../tp_link_protocol');

function MockSocket() {
  this.connect = function(port, host, callback) {};
  this.write = function(msg, encoding, callback) {
    callback();
  };
}
util.inherits(MockSocket, EventEmitter);

describe('SmartPlug', () => {

  var mockSocket;
  var device;

  beforeEach(() => {
    mockSocket = new MockSocket();
    sinon.stub(net, 'Socket', function() { return mockSocket; });
    device = new SmartPlug("127.0.0.1", 9999);
  });

  afterEach(() => {
    sinon.restore(net.Socket);
  });

  describe('#alias', () => {

    it('should return the alias of the device', (done) => {
      device.alias((alias) => {
        expect(alias).toBe("Mock Device");
        done();
      });

      var response = {"system":{"get_sysinfo":{"alias": "Mock Device"}}};
      mockSocket.emit('data', TPLinkProtocol.encrypt(JSON.stringify(response)));
    });

  });

  describe('#getRelayState', () => {

    it('should return the relay state of the device', (done) => {
      device.relayState((state) => {
        expect(state).toBe(1);
        done();
      });

      var response = {"system":{"get_sysinfo":{"relay_state": 1}}};
      mockSocket.emit('data', TPLinkProtocol.encrypt(JSON.stringify(response)));
    });

  });

  describe('#setRelayState', () => {

    it('should send set_relay_state command to the device', () => {
      var sendRequestSpy = sinon.spy(device, 'sendRequest');
      device.setRelayState(1);
      sinon.assert.calledWith(sendRequestSpy, "system", "set_relay_state", {"state": 1});
    });

  });

  describe('#turnOn', () => {

    it('should send setRelayState(1) command to the device', () => {
      var sendRequestSpy = sinon.spy(device, 'sendRequest');
      device.turnOn();
      sinon.assert.calledWith(sendRequestSpy, "system", "set_relay_state", {"state": 1});
    });

  });

  describe('#turnOff', () => {

    it('should send setRelayState(0) command to the device', () => {
      var sendRequestSpy = sinon.spy(device, 'sendRequest');
      device.turnOff();
      sinon.assert.calledWith(sendRequestSpy, "system", "set_relay_state", {"state": 0});
    });

  });

});
