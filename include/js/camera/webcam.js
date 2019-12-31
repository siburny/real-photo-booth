const EXEC = require('child_process').exec;
const Path = require('path');
const fs = require('fs');

class Webcam {
  constructor() {
    this.BIN = Path.resolve(__dirname, 'RobotEyez.exe') + ' /bmp';
  }

  capture(filename, callback) {
    EXEC(this.BIN, {
      cwd: __dirname
    }, function (err) {
      if (err) {
        if (callback) {
          callback(err);
        }
        return;
      }

      fs.rename(Path.resolve(__dirname, 'frame.bmp'), filename, (errRename) => {
        if (errRename) {
          return callback && callback(errRename);
        }

        return callback && callback(errRename, filename);
      });
    });
  }
}

module.exports = Webcam;
