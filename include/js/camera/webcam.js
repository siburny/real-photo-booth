'use strict';

const spawn = require('child_process').spawn;
const Path = require('path');

class Webcam {
  constructor() {
    this.BIN = Path.resolve(__dirname, 'webcapture', 'webcamcapture.exe');
  }

  start() {
    this.process = spawn(this.BIN, ['0'], {
      cwd: Path.resolve(__dirname, 'webcapture'),
      windowsHide: false,
    });

    this.process.on('close', (code) => {
      console.log(`[WEBCAM CLOSE] exited with code ${code}`);
    });

    this.process.stderr.on('data', (data) => {
      console.log('[WEBCAM ERR]', data.toString());
    });
  }
}

module.exports = Webcam;
