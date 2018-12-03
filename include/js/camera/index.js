const Webcam = require('./webcam');

const camera = new Webcam();

module.exports = {
  capture: function (filepath, callback) {
    camera.capture(filepath, function (err, data) {
      callback(err, data);
    });
  },
};
