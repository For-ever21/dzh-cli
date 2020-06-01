#!/usr/bin/env node
const program = require('commander');
const common = require('../common');
const initVue2 = require('./init'); // download vue2.0 模板

const { message } = common;

// 查看版本号
if (process.argv.slice(2).join('') === '-v' || process.argv.slice(2).join('') === '--version') {
  const pkg = require('../../package');
  message.info('vue-cli version ' + pkg.version);
  process.exit()
}

program
  .command('init <name>')
  .version("1.0.0", "-v, --version")
  .description('初始化一个vue-cli项目')
  .action(function (name) {
    name = name || 'mtfyApp';
    initVue2(name)
  });

// TODO 下一版 进行路由，组件模板的操作
program
  .command('create <type> [name] [otherParams...]')
  .alias('c')
  .description('Generates new code')
  .action(function (type, name, otherParams) {

  });

program.parse(process.argv);

const cmd = process.argv[2];
if (!['init', 'n'].includes(cmd)) {
  program.help();
}