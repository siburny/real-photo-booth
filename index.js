const $ = require('jquery');
const ipc = require('electron').ipcRenderer;

//const gm = require('gm').subClass({imageMagick: true});
$('#check').on('click', function () {
  ipc.send('check');
});

ipc.on('checkDone', function (event, arg) {
  alert(arg);
})