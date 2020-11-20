/* craco-plugin-multipage */

import { whenDev } from "@craco/craco";
import getOptions from "./utils/options";
import removePlugin from "./utils/removePlugin";
import getPagesInfo from "./utils/getPagesInfo";
import getPagesReg from "./utils/getPagesRegexp";
import getWebpackConfig from "./utils/getWebpackConfig";
import getIndexPage from "./indexpage/index";
import logger from "./utils/logger";

module.exports = {
  overrideWebpackConfig: ({
    webpackConfig,
    cracoConfig,
    pluginOptions,
    context: { paths },
  }) => {
    let options = {};
    try {
      options = getOptions(paths, pluginOptions);
    } catch (e) {
      logger.error(e.message);
      process.exit(0);
    }

    const pagesRegexp = getPagesReg(options);

    // 移除原有的 plugin
    const { HtmlWebpackPlugin, ManifestPlugin } = removePlugin(webpackConfig);
    const pages = getPagesInfo({ pagesRegexp, paths, options }, options.appSrc);
    if (pages.length === 0) {
      logger.error("没有找到任何入口！(Can`t find any entry!)");
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
      webpackConfig.plugins.unshift(getIndexPage(HtmlWebpackPlugin, plugins));
    });

    // Always return the config object.
    return webpackConfig;
  },
};
