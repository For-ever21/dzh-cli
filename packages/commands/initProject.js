const fs = require("fs-extra");
const {basename, join} = require('path');

const download = require("download-git-repo");
const inquirer = require("inquirer");
const ora = require('ora');
const vfs = require('vinyl-fs');
const map = require('map-stream');

const { objKeySort } = require('../lib/utils');
const { message } = require('../lib/shellHelper');
const { gitUrl, dependencies } = require("../lib/constant");

/**
 * 创建项目
 * @param {string} projectDir 远程仓库地址
 * @param {string} name 项目名称
 */
const createProject = (projectDir, name) => {
  inquirer.prompt([
    {
      type: 'input',
      name: "description",
      message: "请输入项目描述",
      default: function() {
        return 'iwen-project';
      }
    },
    // {
    //   type: 'checkbox',
    //   message: '请选择项目中会用到的插件库',
    //   name: 'components',
    //   choices: [
    //     {
    //       name: '跳过'
    //     },
    //     {
    //       name: 'dayJs'
    //     }
    //   ],
    //   validate: function(answer) {
    //     if (answer.length < 1) {
    //       return '没有想要的，请选择none';
    //     }
    //     return true;
    //   }
    // }
    ]).then((answer) => {
      nextFsExec(projectDir, name, answer);
    });
}

// fs 文件读写操作
const nextFsExec = async (projectDir, name, answer) => {
  const spinner = ora("开始下载模板文件...");
  spinner.start();
  // 下载仓库代码
  await downloadTempFromRep(gitUrl, name).catch((err) => {
    if (err) {
      message.error(`下载git仓库模板出错：errorCode:${err},请联系管理员！`);
      process.exit()
    }
  });
  spinner.stop();
  message.success('模板文件已经下载完毕！');
  // 文件读写操作
  fs.ensureDir(projectDir).then(() => {
    vfs.src(['**/*', '!node_modules/**/*'], {
      cwd: name,
      cwdbase: true,
      dot: true,
    })
    .pipe(map(copyLog))
    .pipe(vfs.dest(projectDir)
    .on('end', function() {
      const app = basename(projectDir);
      // const fileName = `${projectDir}/package.json`;
      // // const content = fs.readFileSync(fileName).toString();
      // const configFile = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
      // configFile.name = "iwen";
      // configFile.description = answer.description;
      // configFile.version = "0.1.0";
      // for (let key of Object.keys(dependencies)) {
      //   // 判断是否选择了哪些库
      //   if (answer.components.includes(key)) {
      //     configFile.dependencies[key] = dependencies[key];
      //   }
      // }
      // configFile.dependencies = objKeySort(configFile.dependencies);
      // fs.writeFileSync(fileName, JSON.stringify(configFile, null, 2));
      message.info('开始下载项目依赖包... ')
      require('./install')({
        success: initComplete.bind(null, app),
        cwd: app
      });
    })
    .resume());
  }).catch(err => {
    console.log(err);
    process.exit();
  });
}

/**
 *从远程仓库下载模板
 * @param {string} repo 远程仓库地址
 * @param {string} name 项目名称
 */
function downloadTempFromRep (repo, name) {
  return new Promise((resolve, reject) => {
    download(repo, name, { clone: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// 初始化项目完毕
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

function initProject(name) {
  const dest = process.cwd();
  const projectDir = join(dest, `./${name}`);
  console.log(dest)
  console.log(projectDir)
  const pkg = require('../../package');
  message.info('IWEN CLI v' + pkg.version);
  if (!fs.existsSync(projectDir)) {
    // 判断项目名是否已存在
    createProject(projectDir, name)
  } else {
    inquirer.prompt([
      {
        type: 'confirm',
        name: "existDir",
        message: "项目名已存在，是否替换掉",
        default: function() {
          return 'iwen-project';
        }
      },
    ]).then((answer) => {
      if (answer.existDir) {
        const spinner = ora(`开始替换 ${name} 文件目录`).start();
        fs
          .emptyDir(projectDir)
          .then(() => {
            spinner.stop();
            message.success(`替换文件目录 ${name} 成功`);
            createProject(projectDir, name);
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

module.exports = initProject;
