const CameraSource = require('./d7000');

const camera = new CameraSource();

module.exports = {
  capture: function (filepath, callback) {
    camera.capture(filepath, function (err, data) {
      callback(err, data);
    });
  },
};
