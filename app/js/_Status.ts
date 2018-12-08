/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const getStatus = callback =>
    request({
        url: 'http://myip.ht/vpn',
        timeout: 3000
    }
        , function(error, response, body) {
            if (error) { return callback(false); }
            if (response && (response.statusCode === 200)) {
                body = JSON.parse(body);
                return callback(body);
            } else {
                return callback(false);
            }
    })
;

// checkStatus type
// c = connect minitoring
// d = disconnect monitoring
const checkStatus = function(type) {
    type = type || 'c';
    if (type === 'c') {
        Debug.info('StatusMonitor', 'Checking connection');
    } else {
        Debug.info('StatusMonitor', 'Checking disconnection');
    }

    if (window.connected && (type === 'c')) {
        return clearTimeout(window.timerMonitor);
    } else {
        return getStatus(function(data) {
            if (window.pendingCallback) {
                if (data) {
                    win.vpnStatus = data;
                    Debug.info('StatusMonitor', 'Remote results', data);
                    if (window.connectionTimeout && (type === 'c') && !window.connected) {
                        Debug.error('StatusMonitor', 'Connection timeout');
                        return OpenVPNManagement.getLog(function(err, log) {
                            Debug.info('StatusMonitor', 'OpenVPN log', {err, log});
                            window.connectionTimeout = false;
                            window.pendingCallback = false;
                            window.connected = false;
                            if (window.timerMonitor) { clearTimeout(window.timerMonitor); }
                            if (window.connectionTimeoutTimer) { clearTimeout(window.connectionTimeoutTimer); }
                            return window.App.VPN.disconnect().then(() => window.App.VPN.connect(window.App.VPN.protocol));
                        });

                    } else if ((type === 'c') && (data.connected === true)) {
                        window.connectionTimeout = false;
                        window.pendingCallback = false;
                        window.connected = true;
                        window.App.VPNClient.setVPNStatus(true);
                        if (window.timerMonitor) { clearTimeout(window.timerMonitor); }
                        if (window.connectionTimeoutTimer) { clearTimeout(window.connectionTimeoutTimer); }
                        return Connected.open();

                    } else if ((type === 'd') && (data.connected === false)) {
                        return disconnectUser();
                    }
                } else {
                    // usefull when we got a route issue
                    if (window.connectionTimeout && !window.connected) {
                        Debug.error('StatusMonitor', 'Connection timeout or route issue');
                        return OpenVPNManagement.getLog(function(err, log) {
                            Debug.info('StatusMonitor', 'OpenVPN log', {err, log});
                            window.connectionTimeout = false;
                            window.pendingCallback = false;
                            window.connected = false;
                            if (window.timerMonitor) { clearTimeout(window.timerMonitor); }
                            if (window.connectionTimeoutTimer) { clearTimeout(window.connectionTimeoutTimer); }
                            return window.App.VPN.disconnect().then(() => window.App.VPN.connect(window.App.VPN.protocol));
                        });
                    }
                }

            } else {
                return Debug.info('StatusMonitor', 'Expired callback');
            }
        });
    }
};

var disconnectUser = () =>
    // wait 5 sec to give time to routes
    setTimeout((function() {
        Debug.info('disconnectUser', 'Disconnected');
        window.connectionTimeout = false;
        window.pendingCallback = false;
        window.connected = false;
        window.App.VPNClient.setVPNStatus(false);
        Details.open();
        if (window.timerMonitor) { clearTimeout(window.timerMonitor); }
        if (window.connectionTimeoutTimer) { return clearTimeout(window.connectionTimeoutTimer); }
    }), 5000)
;

const monitorStatus = function(type) {
    if (window.timerMonitor) { clearTimeout(window.timerMonitor); }
    window.pendingCallback = true;
    return window.timerMonitor = setInterval((() => checkStatus(type)), 2500);
};
