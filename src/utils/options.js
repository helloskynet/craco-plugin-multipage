import program from "commander";
import validateSchema from "../lib/validateSchema";
import pluginOptionsSchema from "../schemas/options";

const defaultOptions = {
  appSrc:'',
  pages: "",
  ignore: "",
  pageTitle: {},
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
  defaultOptions.appSrc = paths.appSrc;

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

  const config =  Object.assign({}, defaultOptions, pluginOptions, { pages, ignore });

  try {
    validateSchema(pluginOptionsSchema, config);
  } catch (e) {
    throw e;
  }

  return config;
}

export default getOptions;
