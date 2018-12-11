// "" /capture /filename c:\Users\maxr\AppData\Roaming\real-photo-booth\photobooth\20181202203204\frame1.jpg

class D7000 {
  constructor() {
    this.execFile = require('child_process').execFile;
  }

  capture(filename, callback) {
    filename += '.jpg';
    this.execFile('c:\\Program Files (x86)\\digiCamControl\\CameraControlCmd.exe', [
      '/capture',
      '/filename',
      filename,
    ], {}, (err) => {
      callback(err, filename);
    });
  }
}

module.exports = D7000;
