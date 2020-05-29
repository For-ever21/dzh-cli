
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

// 对象属性名进行排序
function objKeySort(obj) {
  var newkey = Object.keys(obj).sort();
  var newObj = {};
  for (var i = 0; i < newkey.length; i++) {
    newObj[newkey[i]] = obj[newkey[i]];
  }
  return newObj;
}

module.exports={ message, objKeySort }