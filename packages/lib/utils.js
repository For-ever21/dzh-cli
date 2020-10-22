var validatePageName = require("validate-npm-package-name");

// 对象属性名进行排序
function objKeySort(obj) {
  var newkey = Object.keys(obj).sort();
  var newObj = {};
  for (var i = 0; i < newkey.length; i++) {
    newObj[newkey[i]] = obj[newkey[i]];
  }
  return newObj;
};

/**
 * 校验名称合法性
 * @param {string} name 传入的名称 modName/pageName
 * @param {Array}} validateNameList 非法名数组
 */
const checkNameValidate = (name, validateNameList = []) => {
  const validationResult = validatePageName(name);
  if (!validationResult.validForNewPackages) {
    console.error(
      chalk.red(
        `Cannot create a mod or page named ${chalk.green(
          `"${name}"`
        )} because of npm naming restrictions:\n`
      )
    );
    [
      ...(validationResult.errors || []),
      ...(validationResult.warnings || []),
    ].forEach((error) => {
      console.error(chalk.red(`  * ${error}`));
    });
    console.error(chalk.red("\nPlease choose a different project name."));
    process.exit(1);
  }
  const dependencies = [
    "rax",
    "rax-view",
    "rax-text",
    "rax-app",
    "rax-document",
    "rax-picture",
  ].sort();
  validateNameList = validateNameList.concat(dependencies);

  if (validateNameList.includes(name)) {
    console.error(
      chalk.red(
        `Cannot create a project named ${chalk.green(
          `"${name}"`
        )} because a page with the same name exists.\n`
      ) +
        chalk.cyan(
          validateNameList.map((depName) => `  ${depName}`).join("\n")
        ) +
        chalk.red("\n\nPlease choose a different name.")
    );
    process.exit(1);
  }
};

module.exports={ objKeySort, checkNameValidate };