const $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const moment = require('moment');
const config = require('./config');
const path = require('path');
const fs = require('fs');
const gm = require('gm').subClass({
  imageMagick: true,
  appPath: config.get('startup/convert'),
});

const delay = (t, v) => new Promise(resolve => setTimeout(resolve.bind(null, v), t));

class App {
  constructor() {
    const that = this;
    $('#startPhotoBooth').on('click', function () {
      that.start();
    });
  }

  start() {
    this.framesLeft = config.get('design/frames');
    this.frameDelay = config.get('design/delay');

    this.id = moment(new Date()).format('YYYYMMDDHHmmss');
    this.id = '20181202203204';
    this.path = path.join(config.userDataPath, config.get('capture/content_dir'), this.id);

    if (!fs.existsSync(this.path)) {
      const mkdirp = require('mkdirp');
      mkdirp.sync(this.path);
    }

    $('#step1,#step2,#step3').hide();
    $('#app').show();

    $('#step1 #text1, #step1 #text2, #step1 #text3, #step1 #text4, #step1 #text5').hide();
    $('#step1').addClass('fadein').show();

    var frames = [
      path.join(this.path, 'frame1.bmp'),
      path.join(this.path, 'frame2.bmp'),
      path.join(this.path, 'frame3.bmp'),
    ];
    delay(10)
      /*       .then((res) => {
              frames.push(res);
              return this.captureFrame(1);
            })
            .then((res) => {
              frames.push(res);
              return this.captureFrame(2);
            })
            .then((res) => {
              frames.push(res);
              return this.captureFrame(3);
            })
       */
      .then(() => {
        gm()
          .in(path.resolve(config.get('design/background')))
          .in(frames[0])
          .in('-geometry', '+0+300')
          .in('-composite')
          .in(frames[1])
          .in('-geometry', '+0+700')
          .in('-composite')
          .in(frames[1])
          .in('-geometry', '+0+1100')
          .in('-composite')
          .flatten()

          .write(path.join(this.path, 'final.jpg'), function (err) {
            if (!err) console.log('Final saved');
          });
      })
      .catch((err) => {
        console.log(err);
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

        return new Promise(resolve => {
          ipc.on('camera-capture-done', function (event, result) {
            $('#step1 #text5').removeClass('fadein').hide();
            if (result) {
              resolve(result);
              return;
            }

            throw new Error('Empty file name');
          });
          ipc.send('camera-capture', path.join(this.path, 'frame' + i));
        });
      });
  }
}

module.exports = new App();
