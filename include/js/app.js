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
    var timeoutId = 0;
    let longPress;

    $('#startPhotoBooth').on('click', function () {
      if (longPress) {
        return;
      }
      that.start();
    });

    $('#startPhotoBooth').on('mousedown', function () {
      longPress = false;
      timeoutId = setTimeout(function () {
        longPress = true;
        $('#admin').addClass('fadein').show();
      }, 5000);
    }).on('mouseup mouseleave', function () {
      clearTimeout(timeoutId);
    });
  }

  start() {
    this.framesLeft = config.get('design/frames');
    this.frameDelay = config.get('design/delay');

    this.id = moment(new Date()).format('YYYYMMDDHHmmss');

    // DEBUG
    // this.id = '20181202203204';

    this.path = path.join(config.userDataPath, config.get('capture/content_dir'), this.id);

    if (!fs.existsSync(this.path)) {
      const mkdirp = require('mkdirp');
      mkdirp.sync(this.path);
    }

    $('#step1,#step2,#step3').hide();
    $('#app').show();

    $('#step1 #text1, #step1 #text2, #step1 #text3, #step1 #text4, #step1 #text5, #step1 #text6').hide();
    $('#step1').addClass('fadein').show();

    var frames = [
      // DEBUG
      // path.join(this.path, 'frame1.bmp'),
      // path.join(this.path, 'frame2.bmp'),
      // path.join(this.path, 'frame3.bmp'),
    ];
    delay(10)
      .then(() => {
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
      .then((res) => {
        frames.push(res);
        $('#step1 #text6').addClass('fadein').show();

        let image = gm(config.get('design/width'), config.get('design/height'));
        image = image.in(path.resolve(config.get('design/background')))
          .in('-stroke', 'red')
          .in('-fill', 'none');
        // .in('-draw', 'rectangle 0,0,599,1799')
        // .in('-draw', 'rectangle 600,0,1199,1799')

        const template = config.get('design');
        for (let i = 0; i < template.frames.length; i++) {
          let frame = template.frames[i];
          image = image.in(frames[frame.index])
            .in('-geometry', '' + (frame.width - 2 * frame.padding) + 'x' + (frame.height - 2 * frame.padding)
              + '+' + (frame.x + frame.padding) + '+' + (frame.y + frame.padding))
            .in('-composite');
        }

        const finalImage = path.join(this.path, 'final.jpg');
        image.flatten()
          .write(finalImage, function (err) {
            if (err) {
              console.log(err);
              return;
            }

            console.log('Final saved');

            const execFileSync = require('child_process').execFileSync;
            execFileSync('c:\\Program Files\\IrfanView\\i_view64.exe', [
              finalImage,
              '/print',
            ]);

            console.log('Final printed');

            $('#app').hide();
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
