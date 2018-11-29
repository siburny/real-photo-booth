const config = require('../config')

class Webcam {
  constructor() {
    const NodeWebcam = require("node-webcam");
    this.camera = NodeWebcam.create({});
  }

  capture(filename, callback) {
    this.camera.capture(filename, function (err, data) {
      callback(err, data);
    });
  }
}

module.exports = Webcam;