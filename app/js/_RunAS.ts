/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// function to run with admin privilege
// linux: use gksu or kdesu
// win: use custom vbs
// mac: use osascript

// example: runas 'ls', ['-la']

const runas = function(cmd, args, callback) {
	let child;
	if (process.platform === "linux") {
		return child = exec("which gksu", function(error, stdout, stderr) {
			if (stdout) {
				cmd = stdout.replace(/(\r\n|\n|\r)/gm,"") + " --description \"VPN.ht\" \"" + cmd + " " + args.join(" ") + "\"";
				return child = exec(cmd, function(error, stdout, stderr) {
					Debug.info('RunAS', 'Run command', {cmd, error, stdout, stderr});
					if (error !== null) { return callback(false); }
					return callback(true);
				});
			} else {
				return child = exec("which kdesu", function(error, stdout, stderr) {
					if (stdout) {
						cmd = stdout.replace(/(\r\n|\n|\r)/gm,"") + " -d -c \"" + cmd + " " + args.join(" ") + "\"";
						return child = exec(cmd, function(error, stdout, stderr) {
							Debug.info('RunAS', 'Run command', {cmd, error, stdout, stderr});
							if (error !== null) { return callback(false); }
							return callback(true);
						});
					} else {
						// user need to run our script
						InstallScript.open();
						return callback(false);
					}
				});
			}
		});

	} else if (process.platform === "win32") {
		cmd = `"${path.join(getInstallPathOpenVPN(), 'runas.cmd')}" "${cmd}" ${args.join(" ")}`;
		return child = exec(cmd, function(error, stdout, stderr) {
			Debug.info('RunAS', 'Run command', {cmd, error, stdout, stderr});
			if (error !== null) { return callback(false); }
			return callback(true);
		});
	} else {
		cmd = `osascript -e 'do shell script "${cmd} ${args.join(" ")} " with administrator privileges'`;
		return child = exec(cmd, function(error, stdout, stderr) {
			Debug.info('RunAS', 'Run command', {cmd, error, stdout, stderr});
			if (error !== null) { return callback(false); }
			return callback(true);
		});
	}
};

const spawnas = function(cmd, args, callback) {
	let child;
	args = args || [];

	if (process.platform === "linux") {
		return child = exec("which gksu", function(error, stdout, stderr) {
			if (stdout) {
				cmd = stdout.replace(/(\r\n|\n|\r)/gm,"") + " --description \"VPN.ht\" \"" + cmd + " " + args.join(" ") + "\"";
				Debug.info('SpawnAS', 'Run command', {cmd});
				child = exec(cmd,
					{detached: true}
				);
				child.unref();
				return callback(true);

			} else {
				return child = exec("which kdesu", function(error, stdout, stderr) {
					if (stdout) {
						cmd = stdout.replace(/(\r\n|\n|\r)/gm,"") + " -d -c \"" + cmd + " " + args.join(" ") + "\"";
						Debug.info('SpawnAS', 'Run command', {cmd});
						child = exec(cmd,
							{detached: true}
						);
						child.unref();
						return callback(true);
					} else {
						// user need to run our script
						InstallScript.open();
						return callback(false);
					}
				});
			}
		});

	} else if (process.platform === "win32") {
		cmd = `"${path.join(getInstallPathOpenVPN(), 'runas.cmd')}" ${cmd} ${args.join(" ")}`;
		Debug.info('SpawnAS', 'Run command', {cmd});
		child = exec(cmd,
			{detached: true}
		);
		child.unref();
		return callback(true);
	} else {
		cmd = `osascript -e 'do shell script "${cmd} ${args.join(" ")} " with administrator privileges'`;
		Debug.info('SpawnAS', 'Run command', {cmd});
		child = exec(cmd,
			{detached: true}
		);
		child.unref();
		return callback(true);
	}
};
