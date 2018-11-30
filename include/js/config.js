const electron = require('electron');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const defaults = {
  "startup": {
    "fullscreen": false,
    "showDevTools": false,
    "preventScreensaver": false
  },
  "capture": {
    "camera": "webcam",
    "countdownLength": 3,
    "content_dir": "photobooth"
  },
  "design": {
    "frames": 3,
    "delay": 3
  }
}

class Config {
  constructor() {
    this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.configPath = path.join(this.userDataPath, 'config.json');
    this.data = parseDataFile(this.configPath);
    console.log('Configuration loaded: ' + this.configPath);
  }

  get(key) {
    if (key.indexOf('/') !== -1) {
      key = key.split('/');
      return this.data[key[0]][key[1]];
    }

    return this.data[key];
  }

  set(key, val) {
    if (key.indexOf('/') !== -1) {
      key = key.split('/');
      this.data[key[0]][key[1]] = val;
    } else {
      this.data[key] = val;
    }

    fs.writeFileSync(this.configPath, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath) {
  try {
    let data = {};
    _.merge(data, defaults, JSON.parse(fs.readFileSync(filePath)));
    return data;
  } catch (error) {
    return defaults;
  }
}

module.exports = new Config();