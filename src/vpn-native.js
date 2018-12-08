/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// install pptp
VPN.prototype.installPPTP = function() {
  const defer = Q.defer();
  switch (process.platform) {
    case 'win32':
      var configFile = 'https://client.vpn.ht/config/pptp.txt';
      downloadFileToLocation(configFile, 'pptp.txt').then(temp => {
        // we have our config file now we can setup the radial
        let child;
        const rasphone = path.join(
          process.env.APPDATA,
          'Microsoft',
          'Network',
          'Connections',
          'Pbk',
          'rasphone.pbk'
        );
        return (child = exec(
          `type ${temp} >> ${rasphone}`,
          (error, stdout, stderr) => {
            if (error) {
              Debug.error('InstallError', error);
              return defer.resolve(false);
            }
            Debug.info('InstallLog', 'PPTP installation successfull');
            Debug.info('InstallLog', stdout);

            window.App.advsettings.set('vpnPPTP', true);
            return defer.resolve(true);
          }
        ));
      });
      break;

    default:
      defer.resolve(false);
  }

  return defer.promise;
};

// pptp connection
VPN.prototype.connectPPTP = function() {
  const self = this;
  const defer = Q.defer();
  switch (process.platform) {
    case 'win32':
      var rasdial = path.join(
        process.env.SystemDrive,
        'Windows',
        'System32',
        'rasdial.exe'
      );
      var authString = `${window.App.settings.vpnUsername} ${
        window.App.settings.vpnPassword
      }`;

      var child = exec(
        `${rasdial} vpnht ${authString}`,
        (error, stdout, stderr) => {
          if (error) {
            Debug.error('ConnectError', error);
            return defer.resolve(false);
          }
          // if not connected after 10sec we send timeout
          setTimeout(() => (window.connectionTimeout = true), 10000);

          Debug.info('ConnectLog', 'PPTP connection successfull');
          Debug.info('ConnectLog', stdout);

          self.protocol = 'pptp';
          self.running = true;
          return defer.resolve(true);
        }
      );
      break;

    default:
      defer.resolve(false);
  }

  return defer.promise;
};

VPN.prototype.disconnectPPTP = function() {
  const self = this;
  const defer = Q.defer();
  switch (process.platform) {
    case 'win32':
      var rasdial = path.join(
        process.env.SystemDrive,
        'Windows',
        'System32',
        'rasdial.exe'
      );
      var child = exec(`${rasdial} /disconnect`, (error, stdout, stderr) => {
        if (error) {
          Debug.error('DisconnectError', error);
          return defer.resolve(false);
        }
        Debug.info('DisconnectLog', 'PPTP disconnected successfully');
        Debug.info('DisconnectLog', stdout);

        self.running = false;
        return defer.resolve(true);
      });
      break;

    default:
      defer.resolve(false);
  }

  return defer.promise;
};
