'use strict';

const $ = require('jquery');
const moment = require('moment');
const mkdirp = require('mkdirp');

var config;
(async () => {
  try {
    config = await require('./config').build();
  } catch (e) { }
})();

const flash = require('./flash');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const handlebars = require('handlebars');

const delay = (t, v) =>
  new Promise((resolve) => setTimeout(resolve.bind(null, v), t));

var DEBUG_BORDER = false;

class App {
  constructor() {
    const that = this;

    $('#spinner').hide();

    $('#startPhotoBooth').on('click', function () {
      that.start();
    });

    $('#startPhotoBoothAdmin').on('click', function () {
      let pathContent = path.join(
        config.userDataPath,
        config.get('capture/content_dir'),
      );
      if (!fs.existsSync(pathContent)) {
        mkdirp.sync(pathContent);
      }

      $('#admin').removeClass('fadeout').addClass('fadein').show();
      $('#admin_dialog').hide();
    });

    $('#admin #close').on('click', function () {
      $('#admin').removeClass('fadein').addClass('fadeout');
      setTimeout(function () {
        $('#admin').hide();
      }, 500);
    });

    $('#admin_menu_preview').on(
      'click',
      function () {
        this.id = moment(new Date()).format('YYYYMMDDHHmmss');
        this.path = path.join(
          config.userDataPath,
          config.get('capture/content_dir')
        );
        this.render(['', '', '']).then((finalPath) => {
          $('#admin_dialog').addClass('fadein').show();

          let img = new Image();
          img.src = finalPath;
          img.style = 'max-width:99%;max-height:99%;';

          $('#admin_dialog').html(img);
        });
      }.bind(this)
    );

    $('#admin_menu_camera_capture').on(
      'click',
      function () {
        this.id = moment(new Date()).format('YYYYMMDDHHmmss');
        this.path = path.join(
          config.userDataPath,
          config.get('capture/content_dir')
        );


        $.get(
          'http://localhost:9696/api/shot',
          {
            filename: path.join(this.path, 'frame_preview_' + this.id + '.jpg'),
          },
          async function (data) {
            $('#admin_dialog').addClass('fadein').show();

            let img = new Image();
            img.src = data;
            img.style = 'max-width:99%;max-height:99%;';

            $('#admin_dialog').html(img);
          }
        );
      }.bind(this)
    );

    $('#admin_menu_camera_settings').on('click', function () {
      $.get('http://localhost:9696/api/settings');
    });

    $('#admin_menu_templates').on('click', function () {
      $('#spinner').show();
      fs.readFile(
        path.resolve(__dirname, '../templates/admin_templates.tpl'),
        'utf-8',
        (err, data) => {
          if (err) {
            console.log('An error ocurred reading the file :' + err.message);
            return;
          }

          var template = handlebars.compile(data);

          var url = config.getDefault('startup/api_url', 'https://rub.is/');

          $.getJSON(
            url + '/wp-json/photobooth-assets/v1/get-templates/',
            function (json) {
              $('#admin_dialog').addClass('fadein').show();
              $('#admin_dialog').html(template(json));
            }
          ).always(function () {
            $('#spinner').hide();
          });
        }
      );
    });

    $('#admin_dialog').on('click', 'ul.templates a', function () {
      $('#spinner').show();

      let templateFile = path.join(
        config.userDataPath,
        config.get('capture/content_dir'),
        moment(new Date()).format('YYYYMMDDHHmmss') + '.png'
      );
      var file = fs.createWriteStream(templateFile);

      let client =
        $(this).children('img').attr('src').substring(0, 5) === 'https'
          ? https
          : http;

      client
        .get($(this).children('img').attr('src'), function (response) {
          response.pipe(file);
          file.on('finish', function () {
            config.set('design/background', templateFile);

            $('#admin_dialog').hide();
            $('#spinner').hide();
            file.close();
          });
        })
        .on('error', function () {
          $('#spinner').hide();
          fs.unlink(templateFile);
        });
    });
  }

  start() {
    this.framesLeft = config.get('design/frames');
    this.frameDelay = config.get('design/delay');

    this.id = moment(new Date()).format('YYYYMMDDHHmmss');

    // DEBUG
    // this.id = '20181218092336';

    this.path = path.join(
      config.userDataPath,
      config.get('capture/content_dir'),
      this.id
    );

    if (!fs.existsSync(this.path)) {
      const mkdirp = require('mkdirp');
      mkdirp.sync(this.path);
    }

    $('#main').hide();
    $('#app').show();

    $(
      '#main #text1, #main #text2, #main #text3, #main #text4, #main #text5, #main #text6'
    ).hide();
    $('#main').addClass('fadein').show();

    var frames = [
      // DEBUG
      // path.join(this.path, 'frame1.jpg'),
      // path.join(this.path, 'frame2.jpg'),
      // path.join(this.path, 'frame3.jpg'),
    ];

    delay(10) // DEBUG
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

        $('#main #text6').addClass('fadein').show();
        return this.render(frames);
      })
      .then((finalImage) => {
        App.print(finalImage);

        return delay(15000);
      })
      .then(() => {
        $('#app').hide();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render(frames) {
    const gm = require('gm').subClass({
      imageMagick: true,
      appPath: config.get('startup/convert'),
    });

    let image = gm(config.get('design/width'), config.get('design/height'));
    image = image.in(
      path.resolve(__dirname, '../..', config.get('design/background'))
    );

    if (DEBUG_BORDER) {
      for (let width = 0; width < 50; width += 10) {
        image = image.in('-stroke', 'red').in('-fill', 'none');
        image = image.in(
          '-draw',
          'rectangle ' +
          (0 + width) +
          ',' +
          (0 + width) +
          ',' +
          (599 - width) +
          ',' +
          (1799 - width)
        );

        image = image.in('-stroke', 'blue').in('-fill', 'none');
        image = image.in(
          '-draw',
          'rectangle ' +
          (600 + width) +
          ',' +
          (0 + width) +
          ',' +
          (1199 - width) +
          ',' +
          (1799 - width)
        );
      }
    }

    const template = config.get('design');

    if (DEBUG_BORDER) {
      image = image
        .in('-stroke', 'green')
        .in('-fill', 'none')
        .in('-strokewidth', '10');
      for (let i = 0; i < template.frames.length; i++) {
        let frame = template.frames[i];
        image = image.in(
          '-draw',
          'rectangle ' +
          (frame.x - 1 + frame.padding) +
          ',' +
          (frame.y - 1 + frame.padding) +
          ',' +
          (frame.x + frame.width - frame.padding) +
          ',' +
          (frame.y + frame.height - frame.padding)
        );
      }
    }

    for (let i = 0; i < template.frames.length; i++) {
      let frame = template.frames[i];

      if (!frames[frame.index]) {
        image = image.in(
          '-draw',
          'rectangle ' +
          (frame.x - 1 + frame.padding) +
          ',' +
          (frame.y - 1 + frame.padding) +
          ',' +
          (frame.x + frame.width - frame.padding) +
          ',' +
          (frame.y + frame.height - frame.padding)
        );
      } else {
        image = image
          .in('(')
          .in('-gravity', 'center')
          .in(frames[frame.index])
          .in(
            '-resize',
            '' +
            (frame.width - 2 * frame.padding) +
            'x' +
            (frame.height - 2 * frame.padding) +
            '^'
          )
          .in(
            '-crop',
            '' +
            (frame.width - 2 * frame.padding) +
            'x' +
            (frame.height - 2 * frame.padding) +
            '+0+0'
          )
          .in(
            '-repage',
            '+' + (frame.x + frame.padding) + '+' + (frame.y + frame.padding)
          )
          .in(')');
      }
    }

    const finalImage = path.join(this.path, 'final.jpg');
    return new Promise((resolve, reject) => {
      image.flatten().write(finalImage, function (err) {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        console.log('Final image saved: ' + finalImage);

        resolve(finalImage);
      });
    });
  }

  static print(finalImage) {
    const execFileSync = require('child_process').execFileSync;
    execFileSync('c:\\Program Files\\IrfanView\\i_view64.exe', [
      finalImage,
      '/print',
    ]);

    console.log('Final printed');
  }

  captureFrame(i) {
    flash.FlashStart();

    $('#frameNumber').text('Frame #' + i);
    $('#main #text1').addClass('fadein').show();

    return delay(2000)
      .then(() => {
        return delay(1000);
      })
      .then(() => {
        $('#main #text1').removeClass('fadein').hide();
        $('#main #text2').addClass('enlarge').show();

        return delay(1000);
      })
      .then(() => {
        $('#main #text2').removeClass('enlarge').hide();
        $('#main #text3').addClass('enlarge').show();

        return delay(1000);
      })
      .then(() => {
        $('#main #text3').removeClass('enlarge').hide();
        $('#main #text4').addClass('enlarge').show();

        return delay(1000);
      })
      .then(() => {
        $('#main #text4').removeClass('enlarge').hide();
        $('#main #text5').addClass('fadein').show();

        return delay(1000);
      })
      .then(() => {
        return new Promise(async (resolve) => {
          $.get(
            'http://localhost:9696/api/shot',
            {
              filename: path.join(this.path, 'frame' + i + '.jpg'),
            },
            async function (data) {
              flash.FlashStop();
              $('#main #text5').removeClass('fadein').hide();
              resolve(data);
            }
          );
        });
      });
  }
}

module.exports = new App();
