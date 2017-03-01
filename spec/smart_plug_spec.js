const nock = require('nock');
const util = require('util');
const SmartPlug = require('../smart_plug');

describe('SmartPlug', () => {

  describe('#alias', () => {

    it('should return the alias of the device', (done) => {
      var device = new SmartPlug("127.0.0.1", 9999);
      device.alias().then((alias) => {
          expect(alias).toBe("Mock Device");
          done();
      });
    });

  });

});
