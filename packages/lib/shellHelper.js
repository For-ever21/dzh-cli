const chalk = require('chalk');
const symbols = require('log-symbols');

const message = {
  success (text) {
    console.log(symbols.success, chalk.green.bold(text));
  },
  error (text) {
    console.log(symbols.error, chalk.red.bold(text));
  },
  info (text) {
    console.log(symbols.info, chalk.blue.bold(text));
  },
  warning (text) {
    console.log(symbols.warning, chalk.yellow.bold(text));
  }
};

module.exports={ message };