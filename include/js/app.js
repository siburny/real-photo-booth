const $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const moment = require('moment');
const config = require('./config');
const path = require('path');
const fs = require('fs');

function delay(ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

class App {
  constructor() {
    const that = this;
    $('#startPhotoBooth').on('click', function () {
      that.start();
    });

    // const gm = require('gm').subClass({imageMagick: true});
    /* ipc.on('checkDone', function (event, arg) {
      alert(arg);
    })
      ipc.send('check');
     */
  }

  start() {
    this.framesLeft = config.get('design/frames');
    this.frameDelay = config.get('design/delay');

    this.id = moment(new Date()).format('YYYYMMDDHHmmss');
    this.path = path.join(config.userDataPath, config.get('capture/content_dir'), this.id);

    if (!fs.existsSync(this.path)) {
      const mkdirp = require('mkdirp');
      mkdirp.sync(this.path);
    }

    $('#step1,#step2,#step3').hide();
    $('#app').show();
    $('#step1').addClass('fadein').show();

    $('#step1 #text1, #step1 #text2, #step1 #text3, #step1 #text4, #step1 #text5').hide();

    $('#step1 #text1').addClass('fadein').show();

    setTimeout(() => {
      $('#step1 #text1').removeClass('fadein').hide();
      $('#step1 #text2').addClass('enlarge').show();
    }, 3000);
    setTimeout(() => {
      $('#step1 #text2').removeClass('enlarge').hide();
      $('#step1 #text3').addClass('enlarge').show();
    }, 4000);
    setTimeout(() => {
      $('#step1 #text3').removeClass('enlarge').hide();
      $('#step1 #text4').addClass('enlarge').show();
    }, 5000);
    setTimeout(() => {
      $('#step1 #text4').removeClass('enlarge').hide();
      $('#step1 #text5').addClass('fadein').show();

      ipc.on('camera-capture-done', function (event, arg) {
        alert(arg);
      });

      console.log('Capture frame #1');
      ipc.send('camera-capture', path.join(this.path, 'frame1'));
    }, 5000);
  }
}

module.exports = new App();
