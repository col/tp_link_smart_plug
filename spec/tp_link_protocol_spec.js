const nock = require('nock');
const util = require('util');
const TPLinkProtocol = require('../tp_link_protocol');

describe('TPLinkProtocol', () => {

  describe('#encrypt - include length', () => {

    it('should encrypt a string into an buffer with the first 4 bytes containing the content length', () => {
      var expectedBuffer = new Buffer(7);
      expectedBuffer.writeInt32BE(3, 0);
      expectedBuffer.writeUInt8(202, 4);
      expectedBuffer.writeUInt8(168, 5);
      expectedBuffer.writeUInt8(203, 6);
      expect(TPLinkProtocol.encrypt("abc", true).equals(expectedBuffer)).toBeTruthy();
    });

  });

  describe('#encrypt - excluding length', () => {

    it('should encrypt a string into an encrypted buffer with no length prefix', () => {
      var expectedBuffer = new Buffer(3);
      expectedBuffer.writeUInt8(202, 0);
      expectedBuffer.writeUInt8(168, 1);
      expectedBuffer.writeUInt8(203, 2);
      expect(TPLinkProtocol.encrypt("abc", false).equals(expectedBuffer)).toBeTruthy();
    });

  });

  describe('#decrypt - including length', () => {

    it('should decrypt a valid buffer into the expected string', () => {
      var encryptedBuffer = TPLinkProtocol.encrypt("abc");
      expect(TPLinkProtocol.decrypt(encryptedBuffer)).toBe("abc");
    });

  });

  describe('#decrypt - excluding length', () => {

    it('should decrypt a valid buffer into the expected string', () => {
      var encryptedBuffer = TPLinkProtocol.encrypt("abc", false);
      expect(TPLinkProtocol.decrypt(encryptedBuffer, false)).toBe("abc");
    });

  });

});
