"use strict";

const SmartPlugExplorer = require('./smart_plug_explorer');

var explorer = new SmartPlugExplorer("255.255.255.255", 9999);

explorer.findDevices(devices => {
  console.log("Found "+devices.length+" devices");
});
