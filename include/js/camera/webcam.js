"use strict";

class Webcam {
  constructor() {}

  list_cameras() {
    if (!navigator.mediaDevices) {
      throw new Error("The MediaDevices API is not supported.");
    }

    return navigator.mediaDevices.getUserMedia({
      video: true
    });
  }
}

module.exports = Webcam;