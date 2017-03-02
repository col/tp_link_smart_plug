const nock = require('nock');
const util = require('util');
const sinon = require('sinon');
const net = require('net');
const EventEmitter = require('events').EventEmitter;
const SmartPlug = require('../smart_plug');
const TPLinkProtocol = require('../tp_link_protocol');

function MockSocket() {
  this.connect = function(port, host, callback) {
    callback();
  };
  this.write = function(msg, encoding, callback) {
    callback();
  };
  this.end = function() {};
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

  describe('#fetchSysInfo', () => {

    it('should return the sys info of the device', (done) => {
      device.fetchSysInfo((sysInfo) => {
        expect(sysInfo["alias"]).toBe("Mock Device");
        expect(sysInfo["relay_state"]).toBe(1);
        done();
      });

      var response = {"system":{"get_sysinfo":{"alias": "Mock Device", "relay_state": 1}}};
      mockSocket.emit('data', TPLinkProtocol.encrypt(JSON.stringify(response)));
    });

  });

  describe('#update', () => {

    it('should update the alias and relay_state properties', (done) => {
      device.update(() => {
        expect(device.alias).toBe("New Alias");
        expect(device.relayState).toBe(0);
        done();
      });

      var response = {"system":{"get_sysinfo":{"alias": "New Alias", "relay_state": 0}}};
      mockSocket.emit('data', TPLinkProtocol.encrypt(JSON.stringify(response)));
    });

  });

  describe('#setRelayState', () => {

    it('should send set_relay_state command to the device', () => {
      var sendCommandSpy = sinon.spy(device, 'sendCommand');
      device.setRelayState(1);
      sinon.assert.calledWith(sendCommandSpy, "system", "set_relay_state", {"state": 1});
    });

  });

  describe('#turnOn', () => {

    it('should send setRelayState(1) command to the device', () => {
      var sendCommandSpy = sinon.stub(device, 'sendCommand');
      device.turnOn();
      sinon.assert.calledWith(sendCommandSpy, "system", "set_relay_state", {"state": 1});
    });

  });

  describe('#turnOff', () => {

    it('should send setRelayState(0) command to the device', () => {
      var sendCommandSpy = sinon.spy(device, 'sendCommand');
      device.turnOff();
      sinon.assert.calledWith(sendCommandSpy, "system", "set_relay_state", {"state": 0});
    });

  });

});
