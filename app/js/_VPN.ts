/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var VPN = function() {
	if (!(this instanceof VPN)) { return new VPN(); }
	this.running = false;
	return this.ip = false;
};

temp.track();

VPN.prototype.isInstalled = function() {

	// just to make sure we have a config value
	if (haveBinariesOpenVPN()) {

		// we'll fallback to check if it's been installed
		// form the app ?
		const installed = window.App.advsettings.get("vpn");
		if (installed) {
			return true;
		} else {
			return false;
		}
	}
	return false;
};

VPN.prototype.isDisabled = function() {

	//disabled on demand
	const disabled = window.App.advsettings.get("vpnDisabledPerm");
	if (disabled) {
		return true;
	} else {
		return false;
	}
};

VPN.prototype.isRunning = function() {
	const defer = Q.defer();
	const self = this;
	getStatus(function(data) {
		if (data) {
			return defer.resolve(data.connected);
		}
	});

	return defer.promise;
};

VPN.prototype.connect = function(protocol) {
	hideAll();
	$('.connecting').show();

	const self = this;
	window.connectionTimeout = false;
	window.Bugsnag.metaData = { vpn: {
		protocol
	}
};

	// pptp -- supported by windows only actually
	if (protocol === 'pptp') {

		// we look if we have pptp installed
		const pptpEnabled = window.App.advsettings.get("vpnPPTP");
		if (pptpEnabled) {
			Debug.info('Client', 'Connecting PPTP');
			return this.connectPPTP().then(() => monitorStatus());
		} else {
			Debug.info('Client', 'Installing PPTP');
			return this.installPPTP().then(function() {
				Debug.info('Client', 'Connecting PPTP');
				return self.connectPPTP().then(() => monitorStatus());
			});
		}
	} else {

		// we look if we have openvpn installed
		const ovpnEnabled = window.App.advsettings.get("vpnhtOVPN");
		if (ovpnEnabled && haveBinariesOpenVPN() && haveScriptsOpenVPN()) {
			Debug.info('Client', 'Connecting OpenVPN');
			return this.connectOpenVPN().then(() => monitorStatus());
		} else {
			Debug.info('Client', 'Installing OpenVPN latest version');
			return this.installOpenVPN().then(function() {
				Debug.info('Client', 'Connecting OpenVPN');
				return self.connectOpenVPN().then(() => monitorStatus());
			});
		}
	}
};

VPN.prototype.disconnect = function() {
	hideAll();
	$('.loading').show();

	const self = this;
	window.pendingCallback = false;
	window.connectionTimeout = false;
	if (window.connectionTimeoutTimer) { clearTimeout(window.connectionTimeoutTimer); }
	if (window.timerMonitorConsole) { clearTimeout(window.timerMonitorConsole); }
	if (window.timerMonitor) { clearTimeout(window.timerMonitor); }

	return canConnectOpenVPN()
		.then(function(err) {
			if (err !== false) {
				Debug.info('Client', 'Disconnecting OpenVPN');
				return self.disconnectOpenVPN().then(() => disconnectUser());
			} else {
				Debug.info('Client', 'Disconnecting PPTP');
				return self.disconnectPPTP().then(() => disconnectUser());
			}}).catch(function(err) {
			Debug.info('Client', 'Disconnecting PPTP (fallback)');
			return self.disconnectPPTP().then(() => disconnectUser());
	});
};

VPN.prototype.disconnectAsync = function(callback) {
	hideAll();
	$('.loading').show();

	const self = this;
	window.pendingCallback = false;
	window.connectionTimeout = false;
	if (window.connectionTimeoutTimer) { clearTimeout(window.connectionTimeoutTimer); }
	if (window.timerMonitorConsole) { clearTimeout(window.timerMonitorConsole); }
	if (window.timerMonitor) { clearTimeout(window.timerMonitor); }

	return canConnectOpenVPN()
		.then(function(err) {
			if (err !== false) {
				Debug.info('Client', 'Disconnecting OpenVPN');
				return self.disconnectOpenVPN().then(() => callback());
			} else {
				Debug.info('Client', 'Disconnecting PPTP');
				return self.disconnectPPTP().then(() => callback());
			}}).catch(function(err) {
			Debug.info('Client', 'Disconnecting PPTP (fallback)');
			return self.disconnectPPTP().then(() => callback());
	});
};
