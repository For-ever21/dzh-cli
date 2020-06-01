const fs = require("fs-extra");
const {basename, join} = require('path');

const download = require("download-git-repo");

const inquirer = require("inquirer");
const ora = require('ora');

const vfs = require('vinyl-fs');
const map = require('map-stream');

const { message, objKeySort } = require('../common');

const gitUrl = "direct:https://git.code.tencent.com/silknets_commonH5/mtfy-vue-cli.git#master"

const dependencies = {
  "vue-echarts": "^5.0.0-beta.0",
  "vue-baidu-map": "^0.21.22",
  "mqtt": "^2.18.8",
  "qs": "^6.7.0",
  "dayjs": "^1.8.28",
}

function initComplete(name) {
  message.success(`创建${name} 项目完成!`);
  message.warning(`接下来:
    cd ${name}
    npm run serve / yarn serve
    
    `)
  process.exit();
}

function copyLog(file, cb) {
  message.success(file.path);
  cb(null, file);
}

function createProject(dest, name) {
  inquirer
    .prompt([
      {
        type: 'input',
        name: "description",
        message: "请输入项目描述",
        default: function() {
          return '马踏飞燕项目';
        }
      },
      {
        type: 'input',
        name: "author",
        message: "请输入作者名称",
        default: function() {
          return 'silknets';
        }
      },
      {
        type: 'rawlist',
        name: 'device',
        message: '项目适用环境',
        choices: [
          '移动端',
          // new inquirer.Separator(),
          'PC端',
        ]
      }
    ])
    .then((answers) => {
      if (answers.device === "PC端") {
        // inquirer.prompt([

        // ]).then((answers1) => {

        // })
        message.warning('暂时没有规划PC端模板')
        process.exit();
      } else {
        inquirer.prompt([
          {
            type: 'rawlist',
            name: 'debugger',
            message: '请选择测试环境debug的工具',
            choices: [
              'vconsole',
              'eruda',
            ]
          },
          {
            type: 'checkbox',
            message: '请选择项目中会用到的组件库',
            name: 'components',
            choices: [
              {
                name: 'none'
              },
              {
                name: 'vue-echarts'
              },
              {
                name: 'vue-baidu-map'
              },
              {
                name: 'mqtt'
              },
              {
                name: 'qs'
              },
              {
                name: 'dayJs'
              }
            ],
            validate: function(answer) {
              if (answer.length < 1) {
                return '没有想要的，请选择none';
              }
              return true;
            }
          }
        ]).then((answers1) => {
          const spinner = ora("开始下载模板文件...");
          spinner.start();
          download(gitUrl, name, { clone: true }, (err) => {
            spinner.stop();
            if (err) {
              message.error('git clone 项目模板失败');
              process.exit()
            }
            message.success('模板文件已经下载完毕！');
            fs.ensureDir(dest).then(() => {
              vfs.src(['**/*', '!node_modules/**/*'], {
                cwd: name,
                cwdbase: true,
                dot: true,
              })
              .pipe(map(copyLog))
              .pipe(vfs.dest(dest)
              .on('end', function() {
                const app = basename(dest);
                const fileName = `${dest}/package.json`;
                const content = fs.readFileSync(fileName).toString();
                const configFile = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
                configFile.name = name;
                configFile.description = answers.description;
                configFile.author = answers.author;
                for (let key of Object.keys(dependencies)) {
                  // 判断是否选择了哪些库
                  if (answers1.components.includes(key)) {
                    configFile.dependencies[key] = dependencies[key];
                  }
                }
                configFile.dependencies = objKeySort(configFile.dependencies);
                fs.writeFileSync(fileName, JSON.stringify(configFile, null, 2));
                message.info('开始下载依赖包... ')
                require('../install')({
                  success: initComplete.bind(null, app),
                  cwd: app
                });
              })
              .resume());
            }).catch(err => {
              console.log(err);
              process.exit();
            });
          });
        })
      }
    });
}

function init(name) {
  const dest = process.cwd();
  const appDir = join(dest, `./${name}`);
  // console.log('appDir', appDir)
  const pkg = require('../../package');
  message.info('Mtfy Vue2 CLI v' + pkg.version);
  if (!fs.existsSync(appDir)) {
    createProject(appDir, name)
  } else {
    inquirer.prompt([
      {
        type: 'confirm',
        name: "existDir",
        message: "项目名已存在，是否替换掉",
        default: function() {
          return '马踏飞燕项目';
        }
      },
    ]).then((answer) => {
      if (answer.existDir) {
        const spinner = ora(`开始替换 ${name} 文件目录`).start();
        fs
          .emptyDir(appDir)
          .then(() => {
            spinner.stop();
            message.success(`替换文件目录 ${name} 成功`);
            createProject(appDir, name);
          })
          .catch(err => {
            message.error(`替换文件目录 ${name} 失败！`);
          });
      } else {
        process.exit();
      }
    })
  }
}

module.exports = init;

