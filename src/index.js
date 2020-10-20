/* craco-plugin-multipage */

const { whenDev } = require("@craco/craco");
const getOptions = require("./utils/options");
const removePlugin = require("./utils/removePlugin");
const getPagesInfo = require("./utils/getPagesInfo");
const getPagesReg = require("./utils/getPagesRegexp");
const getWebpackConfig = require("./utils/getWebpackConfig");
const getIndexPage = require("./indexpage/index");

module.exports = {
  overrideWebpackConfig: ({
    webpackConfig,
    cracoConfig,
    pluginOptions,
    context: { paths },
  }) => {
    const options = getOptions(paths, pluginOptions);
    const pagesRegexp = getPagesReg(options);

    // 移除原有的 plugin
    const { HtmlWebpackPlugin, ManifestPlugin } = removePlugin(webpackConfig);
    const pages = getPagesInfo({ pagesRegexp, paths, options }, paths.appSrc);
    if (pages.length === 0) {
      console.error("没有找到任何入口！(Can`t find any entry!)");
      process.exit(1);
    }
    // 生成新的 webpackConfig
    const { plugins, entry } = getWebpackConfig(
      pages,
      HtmlWebpackPlugin,
      ManifestPlugin,
      options
    );
    // 修改入口
    webpackConfig.entry = entry;
    // 添加新的plugin
    webpackConfig.plugins.unshift(...plugins);
    // creat-react-app 中会检查这个文件是否存在
    paths.appIndexJs = pages[0].entry;
    whenDev(() => {
      webpackConfig.output.filename = "static/js/[name].bundle.js";
      // 添加索引页面
      webpackConfig.plugins.unshift(
        getIndexPage(HtmlWebpackPlugin, plugins)
      );
    });

    // Always return the config object.
    return webpackConfig;
  },
};
