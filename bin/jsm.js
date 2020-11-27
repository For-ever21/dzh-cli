#!/usr/bin/env node

'use strict';

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

const program = require('commander');
const pkg = require('../package.json');
const initProject = require('../packages/commands/initProject'); // 初始化项目


if (major < 10) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'ivewCli requires Node 10 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

program.version(pkg.version)

program
  .command('init <project-name>')
  .description('初始化一个vue-cli项目')
  .action(function (name) {
    name = name || 'iwen-cli-project';
    initProject(name)
  });

// TODO 下一版 进行路由，组件模板的新增操作
program
  .command('create <type> [name] [otherParams...]')
  .alias('c')
  .description('添加一个新模块【下一版开发】')
  .action(function (type, name, otherParams) {

  });

program.parse(process.argv);

const cmd = process.argv[2];
if (!['init', 'n'].includes(cmd)) {
  program.help();
}
