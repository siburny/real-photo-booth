'use strict';

const { SerialPort } = require('serialport');

class Flash {
    constructor() {
        this.ready = false;
        var that = this;

        this.port = new SerialPort({
            path: 'COM5',
            baudRate: 57600,
        });

        this.port.open(function () {
            console.log('Port is openning');
        });

        this.port.on('open', function () {
            console.log('Port is opened');
            that.ready = true;
        });

        this.port.on('close', function () {
            console.log('Port is closed');
            that.ready = true;
        });
    }

    FlashStart() {
        if (this.ready) {
            this.port.write('flashon');
        }
    }

    FlashStop() {
        if (this.ready) {
            this.port.write('flashoff');
        }
    }
}

module.exports = new Flash();
