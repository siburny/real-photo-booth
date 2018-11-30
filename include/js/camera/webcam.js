class Webcam {
  constructor() {
    const NodeWebcam = require('node-webcam');
    this.camera = NodeWebcam.create({
      width: 1280,
      height: 720,
    });
  }

  capture(filename, callback) {
    this.camera.capture(filename, function (err, data) {
      callback(err, data);
    });
  }
}

module.exports = Webcam;
