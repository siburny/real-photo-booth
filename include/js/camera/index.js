const path = require('path');
const config = require('../config');
const Webcam = require('./webcam');
const moment = require('moment');
const fs = require('fs');

const camera = new Webcam();

module.exports = {
  capture: function (filename, callback) {
    let filepath = path.join(config.userDataPath, config.get('capture/content_dir'), moment(new Date()).format('YYYYMMDDHHmmss'));

    if (!fs.existsSync(filepath)) {
      const mkdirp = require('mkdirp');
      mkdirp.sync(filepath);
    }

    camera.capture(path.join(filepath, filename), function (err, data) {
      callback(err, data);
    });
  }
};