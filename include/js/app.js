const $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const moment = require('moment');
const config = require('./config');
const path = require('path');
const fs = require('fs');

const delay = (t, v) => new Promise(resolve => setTimeout(resolve.bind(null, v), t));
Promise.prototype.delay = delay;

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

    $('#step1 #text1, #step1 #text2, #step1 #text3, #step1 #text4, #step1 #text5').hide();
    $('#step1').addClass('fadein').show();

    const frames = [];
    this.captureFrame(1)
      .then((filename) => {
        frames.push(filename);
        return this.captureFrame(2);
      })
      .then((filename) => {
        frames.push(filename);
        return this.captureFrame(3);
      })
      .then((filename) => {
        frames.push(filename);
      });
  }

  captureFrame(i) {
    $('#frameNumber').text('Frame #' + i);
    $('#step1 #text1').addClass('fadein').show();

    return delay(3000)
      .then(() => {
        $('#step1 #text1').removeClass('fadein').hide();
        $('#step1 #text2').addClass('enlarge').show();

        return delay(1000);
      })
      .then(() => {
        $('#step1 #text2').removeClass('enlarge').hide();
        $('#step1 #text3').addClass('enlarge').show();

        return delay(1000);
      })
      .then(() => {
        $('#step1 #text3').removeClass('enlarge').hide();
        $('#step1 #text4').addClass('enlarge').show();

        return delay(1000);
      })
      .then(() => {
        $('#step1 #text4').removeClass('enlarge').hide();
        $('#step1 #text5').addClass('fadein').show();

        ipc.on('camera-capture-done', function (event, arg) {
          $('#step1 #text5').removeClass('fadein').hide();
          if (arg) {
            return arg;
          }

          throw new Error('Empty file name');
        });
        ipc.send('camera-capture', path.join(this.path, 'frame' + i));
      });
  }
}

module.exports = new App();
