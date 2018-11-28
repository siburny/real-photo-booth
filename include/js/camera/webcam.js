const NodeWebcam = require("node-webcam");

class Webcam {
  constructor() {}

  list_cameras(callback) {
    console.log('start');
    NodeWebcam.capture("test_picture", {}, function (err, data) {
      console.log('callback');
      callback(err, data);
    });
    console.log('end');
  }
}

module.exports = Webcam;