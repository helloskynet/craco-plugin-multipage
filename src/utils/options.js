const program = require("commander");
const { isString, isObject, isFunction } = require("lodash");

const defaultOptions = {
  pages: "",
  ignore: "",
  pageTitle: "React App",
  defaultTitle: "React App",
  htmlOutputDir: "pages",
  HtmlWebpackPluginOptions: {},
};
/**
 * 检查用户配置
 * 根据插件配置，命令行配置，默认配置生成新的配置,
 * @param {Object} paths
 * @param {Object} pluginOptions
 */
function getOptions(paths, pluginOptions = {}) {
  /* eslint-disable import/no-dynamic-require */
  const packages = require(paths.appPackageJson);
  checkOptions(pluginOptions);

  program
    .version(packages.version)
    .allowUnknownOption(true)
    .option("--pages [page1,page2]", "只启动或编译指定的页面")
    .option("--ignore [page1,page2]", "忽略指定页面，优先级高于--pages")
    .parse(process.argv);

  let pages = program.pages || "";

  if (pluginOptions.pages) {
    pages = `${pages},${pluginOptions.pages}`;
  }

  let ignore = program.ignore || "";
  if (pluginOptions.ignore) {
    ignore = `${ignore},${pluginOptions.ignore}`;
  }

  return Object.assign({}, defaultOptions, pluginOptions, { pages, ignore });
}

function checkOptions(options) {
  if (options.hasOwnProperty('pages') && !isString(options.pages)) {
    console.log(
      "pages 必须为string类型，请检查配置！(pages`s type should be a string)"
    );
    process.exit(1);
  }
  if (options.hasOwnProperty('ignore') && !isString(options.ignore)) {
    console.log(
      "ignore 必须为string类型，请检查配置！(ignore`s type should be a string)"
    );
    process.exit(1);
  }
  if (options.hasOwnProperty("defaultTitle") && !isString(options.defaultTitle)) {
    console.log(
      "defaultTitle 必须为string类型，请检查配置！(defaultTitle`s type should be a string)"
    );
    process.exit(1);
  }
  if (options.hasOwnProperty('htmlOutputDir') && !isString(options.htmlOutputDir)) {
    console.log(
      "htmlOutputDir 必须为string类型，请检查配置！(htmlOutputDir`s type should be a string)"
    );
    process.exit(1);
  }
  if (
    options.hasOwnProperty('pageTitle') &&
    !isString(options.pageTitle) &&
    !isObject(options.pageTitle)
  ) {
    console.log(
      "pageTitle 必须为{string|object}类型，请检查配置！(pageTitle`s type should be a {string|object})"
    );
    process.exit(1);
  }
  if (
    options.hasOwnProperty('HtmlWebpackPluginOptions') &&
    !isFunction(options.HtmlWebpackPluginOptions) &&
    !isObject(options.HtmlWebpackPluginOptions)
  ) {
    console.log(
      "HtmlWebpackPluginOptions 必须为{function|object}类型，请检查配置！(HtmlWebpackPluginOptions`s type should be a {function|object})"
    );
    process.exit(1);
  }
}

module.exports = getOptions;
