'use strict';

const spawn = require('child_process').spawn;
const Path = require('path');

class Webcam {
  constructor() {
    this.BIN = Path.resolve(__dirname, 'webcapture', 'webcamcapture.exe');

    this.process = spawn(this.BIN, {
      cwd: Path.resolve(__dirname, 'webcapture'),
    });

    this.process.on('close', (code) => {
      console.log(`[WEBCAM CLOSE] exited with code ${code}`);
    });

    this.process.stderr.on('data', (data) => {
      console.log('[WEBCAM ERR]', data.toString());
    });

    this.process.stdout.on('data', (data) => {
      console.log('[WEBCAM]', data.toString());
    });
  }

  capture(filename, callback) {
    var thatP = this.process;
    this.process.stdin.write(`shot ${filename}\r\n`, function (err) {
      if (err) {
        if (callback) {
          callback(err);
        }

        return;
      }

      thatP.stdout.once('data', function (data) {
        return callback && callback(undefined, data.toString().trim());
      });
    });
  }
}

module.exports = Webcam;
