'use strict';

const CameraSource = require('./webcam');

const camera = new CameraSource();

module.exports = {
  capture: function (filepath, callback) {
    camera.capture(filepath, function (err, data) {
      callback(err, data);
    });
  },
};
