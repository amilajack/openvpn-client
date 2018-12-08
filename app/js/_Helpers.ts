/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs   = require("fs");
const path = require("path");

const hideAll = function() {
    $('.login').hide();
    $('.status').hide();
    $('.installScript').hide();
    $('.details').hide();
    $('.connecting').hide();
    return $('.loading').hide();
};

const autoLogin = function() {
    Debug.info('autoLogin', 'Initializing autologin', {username: window.App.settings.vpnUsername});
    // we check if we have existing login and we auto login
    if (window.App && window.App.settings.vpnUsername && window.App.settings.vpnPassword) {
        $('#username').val(window.App.settings.vpnUsername);
        $('#password').val(window.App.settings.vpnPassword);
        return Auth.login();
    }
};

const downloadTarballAndExtract = function(url) {

    Debug.info('downloadTarballAndExtract', 'Download tarball', {url});

    const defer = Q.defer();
    const tempPath = temp.mkdirSync("popcorntime-openvpn-");
    const stream = tar.Extract({path: tempPath});
    stream.on("end", () => defer.resolve(tempPath));

    stream.on("error", () => defer.resolve(false));

    createReadStream({url}, requestStream => requestStream.pipe(zlib.createGunzip()).pipe(stream));

    return defer.promise;
};

const downloadFileToLocation = function(url, name) {

    Debug.info('downloadFileToLocation', 'Download file', {name, url});

    const defer = Q.defer();
    let tempPath = temp.mkdirSync("popcorntime-openvpn-");
    tempPath = path.join(tempPath, name);
    const stream = fs.createWriteStream(tempPath);
    stream.on("finish", () => defer.resolve(tempPath));

    stream.on("error", () => defer.resolve(false));

    createReadStream({url} , requestStream => requestStream.pipe(stream));

    return defer.promise;
};

var createReadStream = (requestOptions, callback) => callback(request.get(requestOptions));


// move file
const copyToLocation = function(targetFilename, fromDirectory) {

    Debug.info('copyToLocation', 'Copy file', {targetFilename, fromDirectory});
    const defer = Q.defer();
    mv(fromDirectory, targetFilename, err => defer.resolve(err));

    return defer.promise;
};

const rmdirSync = function(dir) {
  const list = fs.readdirSync(dir);
  for (let item of Array.from(list)) {
    const filename = path.join(dir, item);
    const stat = fs.statSync(filename);
    if ([".", ".."].includes(filename)) {
      // Skip
    } else if (stat.isDirectory()) {
      // Remove directory recursively
      rmdir(filename);
    } else {
      // Remove file
      fs.unlinkSync(filename);
    }
  }
  return fs.rmdirSync(dir);
};

// copy instead of mv (so we keep original)
const copy = function(source, target, cb) {
	const done = function(err) {
		if (!cbCalled) {
			cb(err);
			var cbCalled = true;
}
};
	const cbCalled = false;
	const rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});

	const wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		done(err);
	});

	wr.on("close", function(ex) {
		done();
	});

	rd.pipe(wr);
};
