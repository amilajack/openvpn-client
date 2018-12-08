// function to run with admin privilege
// linux: use gksu or kdesu
// win: use custom vbs
// mac: use osascript

// example: runas 'ls', ['-la']

const runas = function(cmd, args, callback) {
  let child;
  if (process.platform === 'linux') {
    return (child = exec('which gksu', (error, stdout, stderr) => {
      if (stdout) {
        cmd = `${stdout.replace(
          /(\r\n|\n|\r)/gm,
          ''
        )} --description "VPN.ht" "${cmd} ${args.join(' ')}"`;
        return (child = exec(cmd, (error, stdout, stderr) => {
          Debug.info('RunAS', 'Run command', { cmd, error, stdout, stderr });
          if (error !== null) {
            return callback(false);
          }
          return callback(true);
        }));
      }
      return (child = exec('which kdesu', (error, stdout, stderr) => {
        if (stdout) {
          cmd =
            stdout.replace(/(\r\n|\n|\r)/gm, '') +
            ' -d -c "' +
            cmd +
            ' ' +
            args.join(' ') +
            '"';
          return (child = exec(cmd, (error, stdout, stderr) => {
							Debug.info('RunAS', 'Run command', {cmd, error, stdout, stderr});
							if (error !== null) { return callback(false); }
							return callback(true);
						});
        }
        // user need to run our script
        InstallScript.open();
        return callback(false);
      }));
    }));
  }
  if (process.platform === 'win32') {
    cmd = `"${path.join(
      getInstallPathOpenVPN(),
      'runas.cmd'
    )}" "${cmd}" ${args.join(' ')}`;
    return (child = exec(cmd, (error, stdout, stderr) => {
      Debug.info('RunAS', 'Run command', { cmd, error, stdout, stderr });
      if (error !== null) {
        return callback(false);
      }
      return callback(true);
    }));
  }
  cmd = `osascript -e 'do shell script "${cmd} ${args.join(
    ' '
  )} " with administrator privileges'`;
  return (child = exec(cmd, (error, stdout, stderr) => {
    Debug.info('RunAS', 'Run command', { cmd, error, stdout, stderr });
    if (error !== null) {
      return callback(false);
    }
    return callback(true);
  }));
};

const spawnas = function(cmd, args, callback) {
  let child;
  args = args || [];

  if (process.platform === 'linux') {
    return (child = exec('which gksu', (error, stdout, stderr) => {
      if (stdout) {
        cmd = `${stdout.replace(
          /(\r\n|\n|\r)/gm,
          ''
        )} --description "VPN.ht" "${cmd} ${args.join(' ')}"`;
        Debug.info('SpawnAS', 'Run command', { cmd });
        child = exec(cmd, { detached: true });
        child.unref();
        return callback(true);
      }
      return (child = exec('which kdesu', (error, stdout, stderr) => {
        if (stdout) {
          cmd =
            stdout.replace(/(\r\n|\n|\r)/gm, '') +
            ' -d -c "' +
            cmd +
            ' ' +
            args.join(' ') +
            '"';
          Debug.info('SpawnAS', 'Run command', { cmd });
          child = exec(cmd, { detached: true });
          child.unref();
          return callback(true);
        }
        // user need to run our script
        InstallScript.open();
        return callback(false);
      }));
    }));
  }
  if (process.platform === 'win32') {
    cmd = `"${path.join(
      getInstallPathOpenVPN(),
      'runas.cmd'
    )}" ${cmd} ${args.join(' ')}`;
    Debug.info('SpawnAS', 'Run command', { cmd });
    child = exec(cmd, { detached: true });
    child.unref();
    return callback(true);
  }
  cmd = `osascript -e 'do shell script "${cmd} ${args.join(
    ' '
  )} " with administrator privileges'`;
  Debug.info('SpawnAS', 'Run command', { cmd });
  child = exec(cmd, { detached: true });
  child.unref();
  return callback(true);
};
