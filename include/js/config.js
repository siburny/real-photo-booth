'use strict';

const electron = require('electron');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const defaults = {
  startup: {
    fullscreen: false,
    showDevTools: false,
    preventScreensaver: false,
    convert: '',
  },
  capture: {
    camera: 'webcam',
    countdownLength: 3,
    content_dir: 'photobooth',
  },
  design: {
    frames: 3,
    background: './include/images/template.png',
  },
};

class Config {
  constructor() {
    this.userDataPath = (electron.app || require('@electron/remote').app).getPath('userData');
    this.configPath = path.join(this.userDataPath, 'config.json');
    this.data = Config.parseDataFile(this.configPath);
    console.log('Configuration loaded: ' + this.configPath);
    this.save();
  }

  get(key) {
    if (key.indexOf('/') !== -1) {
      key = key.split('/');
      return this.data[key[0]][key[1]];
    }

    return this.data[key];
  }

  getDefault(key, defaultValue) {
    let ret = this.get(key);
    if (typeof (ret) === 'undefined') {
      this.set(key, defaultValue);
      return defaultValue;
    }

    return ret;
  }

  set(key, val) {
    if (key.indexOf('/') !== -1) {
      key = key.split('/');
      this.data[key[0]][key[1]] = val;
    } else {
      this.data[key] = val;
    }

    this.save();
  }

  save() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2));
  }

  static parseDataFile(filePath) {
    try {
      let data = {};
      let file = JSON.parse(fs.readFileSync(filePath));
      _.merge(data, defaults, file);
      return data;
    } catch (error) {
      return defaults;
    }
  }
}

module.exports = new Config();
