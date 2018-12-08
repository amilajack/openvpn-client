/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('underscore');
const request = require('request');
const { exec } = require("child_process");
const { spawn } = require("child_process");
const Q = require("q");
const tar = require("tar");
const temp = require("temp");
const zlib = require("zlib");
const mv = require("mv");
const fs = require("fs");
const path = require("path");
const gui = require('nw.gui');
const win = gui.Window.get();
const timerMonitor = false;
const connectionTimeoutTimer = false;
const timerMonitorConsole = false;
const connectionTimeout = false;
const pendingCallback = false;
const openvpnSocket = false;
const connected = false;

const version = '0.1.0-3';
win.title = gui.App.manifest.name + ' VPN ' + version;

win.focus();

win.on("new-win-policy", (frame, url, policy) => policy.ignore());

const preventDefault = e => e.preventDefault();

window.addEventListener("dragover", preventDefault, false);
window.addEventListener("drop", preventDefault, false);
window.addEventListener("dragstart", preventDefault, false);

$(function() {
    $('#windowControlMinimize').on('click', () => win.minimize());

    return $('#windowControlClose').on('click', () => win.close());
});
