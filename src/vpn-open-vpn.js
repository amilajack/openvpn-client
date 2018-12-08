/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
VPN.prototype.installOpenVPN = function() {
  const self = this;
  const defer = Q.defer();

  const openvpnPath = getInstallPathOpenVPN();

  // check if we have path
  if (fs.existsSync(openvpnPath)) {
    // remove all previous install
    try {
      rmdirSync(openvpnPath);
    } catch (e) {
      Debug.error('installOpenVPN', 'Error', e);
    }
  }

  switch (process.platform) {
    case 'darwin':
      var tarball = 'https://client.vpn.ht/bin/openvpn-mac.tar.gz';
      downloadTarballAndExtract(tarball).then(temp =>
        // we install openvpn
        copyToLocation(openvpnPath, temp).then(err =>
          self.downloadOpenVPNConfig().then(err => {
            window.App.advsettings.set('vpnhtOVPN', true);
            return defer.resolve();
          })
        )
      );
      break;

    case 'linux':
      var arch = process.arch === 'ia32' ? 'x86' : process.arch;
      tarball = `https://client.vpn.ht/bin/openvpn-linux-${arch}.tar.gz`;
      downloadTarballAndExtract(tarball).then(temp =>
        // we install openvpn
        copyToLocation(openvpnPath, temp).then(err =>
          self.downloadOpenVPNConfig().then(err => {
            window.App.advsettings.set('vpnhtOVPN', true);
            return defer.resolve();
          })
        )
      );
      break;

    case 'win32':
      tarball = 'https://client.vpn.ht/bin/openvpn-win.tar.gz';
      downloadTarballAndExtract(tarball).then(temp =>
        // we install openvpn
        copyToLocation(openvpnPath, temp).then(err =>
          self.downloadOpenVPNConfig().then(err => {
            // we install tap
            const args = ['/S'];

            // path to our install file
            const tapInstall = path.join(openvpnPath, 'tap.exe');
            Debug.info('installOpenVPN', 'Tap install', { tapInstall, args });

            return runas(tapInstall, args, success => {
              let timerCheckDone;
              return (
                (timerCheckDone = setInterval(() => {
                  const haveTap = haveBinariesTAP();
                  Debug.info('installOpenVPN', 'Waiting tap installation', {
                    haveTap
                  });
                  if (haveTap) {
                    // kill the timer to prevent looping
                    window.clearTimeout(timerCheckDone);
                    // temp fix add 5 sec timer once we have all bins
                    // to make sure the service and tap are ready
                    return setTimeout(() => {
                                        window.App.advsettings.set("vpnhtOVPN", true);
                                        return defer.resolve();
                                    }), 5000);
                  }
                })),
                1000
              );
            });
          })
        )
      );
      break;
  }
  return defer.promise;
};

VPN.prototype.downloadOpenVPNConfig = function() {
  // make sure path exist
  let configFile;
  try {
    if (!fs.existsSync(getInstallPathOpenVPN())) {
      fs.mkdirSync(getInstallPathOpenVPN());
    }
  } catch (e) {
    Debug.error('downloadOpenVPNConfig', 'Error', e);
  }

  if (process.platform === 'win32') {
    configFile = 'https://client.vpn.ht/config/vpnht.win.ovpn';
  } else {
    configFile = 'https://client.vpn.ht/config/vpnht.ovpn';
  }

  Debug.info(
    'downloadOpenVPNConfig',
    'Downloading OpenVPN configuration file',
    { configFile }
  );
  return downloadFileToLocation(configFile, 'config.ovpn').then(temp =>
    copyToLocation(path.resolve(getInstallPathOpenVPN(), 'vpnht.ovpn'), temp)
  );
};

VPN.prototype.disconnectOpenVPN = function() {
  const defer = Q.defer();
  const self = this;

  OpenVPNManagement.send('signal SIGTERM', (err, data) => defer.resolve());

  return defer.promise;
};

VPN.prototype.connectOpenVPN = function() {
  const defer = Q.defer();
  const fs = require('fs');
  const self = this;
  let tempPath = temp.mkdirSync('popcorntime-vpnht');
  tempPath = path.join(tempPath, 'o1');
  // now we need to make sure we have our openvpn.conf
  const vpnConfig = path.resolve(getInstallPathOpenVPN(), 'vpnht.ovpn');
  if (fs.existsSync(vpnConfig)) {
    let args;
    let openvpn;
    let upScript;
    if (process.platform === 'linux') {
      // in linux we need to add the --dev tun0
      args = [
        '--daemon',
        '--management',
        '127.0.0.1',
        '1337',
        '--dev',
        'tun0',
        '--config',
        `'${vpnConfig}'`,
        '--management-query-passwords',
        '--management-hold',
        '--script-security',
        '2'
      ];
    } else if (process.platform === 'darwin') {
      // darwin
      upScript = path
        .resolve(getInstallPathOpenVPN(), 'script.up')
        .replace(' ', '\\\\ ');
      const downScript = path
        .resolve(getInstallPathOpenVPN(), 'script.down')
        .replace(' ', '\\\\ ');
      args = [
        '--daemon',
        '--management',
        '127.0.0.1',
        '1337',
        '--config',
        `\\"${vpnConfig}\\"`,
        '--management-query-passwords',
        '--management-hold',
        '--script-security',
        '2',
        '--up',
        `\\"${upScript}\\"`,
        '--down',
        `\\"${downScript}\\"`
      ];
    } else {
      // win
      upScript = path
        .resolve(getInstallPathOpenVPN(), 'up.cmd')
        .replace(/\\/g, '\\\\');
      // windows cant run in daemon
      args = [
        '--management',
        '127.0.0.1',
        '1337',
        '--config',
        `"${vpnConfig}"`,
        '--management-query-passwords',
        '--management-hold',
        '--script-security',
        '2'
      ];
    }

    if (process.platform === 'win32') {
      openvpn = path.resolve(getInstallPathOpenVPN(), 'openvpn.exe');
    } else {
      openvpn = path.resolve(getInstallPathOpenVPN(), 'openvpn');
    }

    Debug.info('connectOpenVPN', 'OpenVPN', { bin: openvpn, args });

    // make sure we have our bin
    if (fs.existsSync(openvpn)) {
      // need to escape
      if (process.platform === 'darwin') {
        openvpn = `\\"${openvpn}\\"`;
      } else if (process.platform === 'win32') {
        openvpn = `"${openvpn}"`;
      } else {
        openvpn = `'${openvpn}'`;
      }

      spawnas(openvpn, args, success => {
        self.running = true;
        self.protocol = 'openvpn';

        // we should monitor the management port
        // when it's ready we connect

        return monitorManagementConsole(
          () =>
            // wait 2s
            setTimeout(() => {
              Debug.info('connectOpenVPN', 'Hold release');
              return OpenVPNManagement.send(
                'hold release',
                (err, data) =>
                  // wait 2s
                  setTimeout(() => {
                    Debug.info('connectOpenVPN', 'Sending username');
                    return OpenVPNManagement.send(
                      `username "Auth" "${window.App.settings.vpnUsername}"`,
                      (err, data) =>
                        // wait 2s
                        setTimeout(() => {
                                        Debug.info('connectOpenVPN', 'Sending password');
                                        return OpenVPNManagement.send(`password "Auth" "${window.App.settings.vpnPassword}"`, function(err, data) {

                                            // if not connected after 30sec we send timeout
                                            Debug.info('connectOpenVPN', 'Authentification sent');
                                            if (window.connectionTimeoutTimer) { clearTimeout(window.connectionTimeoutTimer); }
                                            window.connectionTimeoutTimer = setTimeout((() => window.connectionTimeout = true), 60000);
                                            return defer.resolve();
                                    });
                                    }), 2000)
                    );
                  }),
                2000
              );
            }),
          2000
        );
        // );
      });
    } else {
      Debug.error('connectOpenVPN', 'OpenVPN bin not found', { openvpn });
      defer.reject('openvpn_bin_not_found');
    }
  } else {
    Debug.error('connectOpenVPN', 'OpenVPN config not found', { vpnConfig });
    defer.reject('openvpn_config_not_found');
  }

  return defer.promise;
};

// openvpn wait management interface to be ready
var monitorManagementConsole = function(callback) {
  Debug.info(
    'monitorManagementConsole',
    'Waiting OpenVPN monitor interface to be ready on port 1337'
  );
  if (window.timerMonitorConsole) {
    clearTimeout(window.timerMonitorConsole);
  }
  window.pendingCallback = true;
  return (window.timerMonitorConsole = setInterval(
    () =>
      canConnectOpenVPN()
        .then(err => {
          if (err !== false) {
            Debug.info('monitorManagementConsole', 'Interface ready');
            clearTimeout(window.timerMonitorConsole);
            return callback();
          }
        })
        .catch(err => clearTimeout(window.timerMonitorConsole)),
    2000
  ));
};

// we look if we have bin
const haveBinariesOpenVPN = function() {
  switch (process.platform) {
    case 'darwin':
    case 'linux':
      var bin = path.resolve(getInstallPathOpenVPN(), 'openvpn');
      var exist = fs.existsSync(bin);
      Debug.info('haveBinariesOpenVPN', 'Checking OpenVPN binaries', {
        bin,
        exist
      });
      return exist;
    case 'win32':
      bin = path.resolve(getInstallPathOpenVPN(), 'openvpn.exe');
      exist = fs.existsSync(bin);
      Debug.info('haveBinariesOpenVPN', 'Checking OpenVPN binaries', {
        bin,
        exist
      });
      return exist;
    default:
      return false;
  }
};

var haveBinariesTAP = function() {
  switch (process.platform) {
    case 'win32':
      var bin = path.resolve(
        process.env.ProgramW6432 || process.env.ProgramFiles,
        'TAP-Windows',
        'bin',
        'devcon.exe'
      );
      var exist = fs.existsSync(bin);
      Debug.info('haveBinariesTAP', 'Checking TAP binaries', { bin, exist });
      return exist;
    default:
      return false;
  }
};

const haveScriptsOpenVPN = function() {
  switch (process.platform) {
    case 'darwin':
      var script = path.resolve(getInstallPathOpenVPN(), 'script.up');
      var exist = fs.existsSync(script);
      Debug.info('haveScripts', 'Checking OpenVPN scripts', { script, exist });
      return exist;
    case 'win32':
      script = path.resolve(getInstallPathOpenVPN(), 'up.cmd');
      exist = fs.existsSync(script);
      Debug.info('haveScripts', 'Checking OpenVPN scripts', { script, exist });
      return true;
    default:
      return true;
  }
};

// get pid of openvpn
// used in linux and mac
const getPidOpenVPN = function() {
  const defer = Q.defer();
  OpenVPNManagement.send('pid', (err, data) => {
    if (err) {
      Debug.error('getPidOpenVPN', 'Get OpenVPN pid', { err, data });
      return defer.resolve(false);
    }
    if (data && data.indexOf('SUCCESS') > -1) {
      Debug.info('getPidOpenVPN', 'Get OpenVPN pid', { data });
      return defer.resolve(data.split('=')[1]);
    }
    Debug.info('getPidOpenVPN', 'Get OpenVPN pid', { data });
    return defer.resolve(false);
  });

  return defer.promise;
};

var canConnectOpenVPN = function() {
  const defer = Q.defer();
  OpenVPNManagement.send('pid', (err, data) => {
    Debug.info('canConnectOpenVPN', 'Validate OpenVPN Process', { err, data });
    if (err) {
      return defer.resolve(false);
    }
    return defer.resolve(true);
  });

  return defer.promise;
};

// helper to get vpn install path
var getInstallPathOpenVPN = function(type) {
  type = type || false;
  const binpath = path.join(process.cwd(), '.openvpnht');
  return binpath;
};
