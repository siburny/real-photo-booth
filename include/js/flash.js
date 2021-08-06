'use strict';

const SerialPort = require('serialport');

class Flash {
  constructor() {
    this.ready = false;
    var that = this;

    this.port = new SerialPort('COM5', {
      baudRate: 57600
    });

    this.port.open(function () {
      console.log('Port is openning');
    });

    this.port.on('open', function () {
      console.log('Port is opened');
      that.ready = true;
    });
  }

  MakeFlash() {
    if (this.ready) {
      this.port.write('flash');
    }
  }
}

module.exports = new Flash();
