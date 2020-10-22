const which = require('which');
const chalk = require('chalk');
const symbols = require('log-symbols');

function runCmd({cmd, success, cwd, params}) {
  params = params || [];
  const runner = require('child_process').spawn(cmd, params, {
    cwd,
    stdio: 'inherit',
  });
  runner.on('close', function(code) {
    success && success(code);
  })
}

function findNpm() {
  const npms = process.platform === 'win32'
    ? ['yarn.cmd', 'tnpm.cmd', 'cnpm.cmd', 'npm.cmd']
    : ['yarn', 'tnpm', 'cnpm', 'npm'];
  for (var i = 0; i < npms.length; i++) {
    try {
      which.sync(npms[i]);
      // console.log('使用 npm:' + npms[i]);
      return npms[i];
    } catch (e) {}
  }
  throw new Error(symbols.error, chalk.red('请安装npm工具！'));
}

module.exports = function install({success, cwd}) {
  const npm = findNpm();
  runCmd({
    cmd: which.sync(npm),
    params: ['install'],
    success,
    cwd,
  });
};
