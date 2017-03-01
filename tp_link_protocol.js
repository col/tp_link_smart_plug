'use strict';

const INITIALIZATION_VECTOR = 171;

module.exports = {

  encrypt: function(content, includeLength) {
    includeLength = (typeof includeLength !== 'undefined') ?  includeLength : true;

    var encrypted = new Buffer(includeLength ? 4+content.length : content.length);
    if (includeLength) {
      encrypted.writeUInt32BE(content.length, 0);
    }
    var key = INITIALIZATION_VECTOR;
    for(var i = 0; i < content.length; i++) {
      var char = content.charCodeAt(i);
      var cipher = key ^ char;
      encrypted.writeUInt8(cipher, includeLength ? 4+i : i);
      key = cipher;
    }
    return encrypted;
  },

  decrypt: function(buffer, includesLength) {
    includesLength = (typeof includesLength !== 'undefined') ?  includesLength : true;

    var content = includesLength ? buffer.slice(4, buffer.length) : buffer;
    var decrypted = new Buffer(content.length);
    var key = INITIALIZATION_VECTOR;
    for(var i = 0; i < content.length; i++) {
        var byte = content[i];
        decrypted.writeUInt8(key ^ byte, i);
        key = byte;
    }
    return decrypted.toString();
  }

}
