'use strict';

var craco = require('@craco/craco');
var program = require('commander');
var lodash = require('lodash');
var fs = require('fs');
var path = require('path');
var pathToRegexp = require('path-to-regexp');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var program__default = /*#__PURE__*/_interopDefaultLegacy(program);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

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

  program__default['default']
    .version(packages.version)
    .allowUnknownOption(true)
    .option("--pages [page1,page2]", "只启动或编译指定的页面")
    .option("--ignore [page1,page2]", "忽略指定页面，优先级高于--pages")
    .parse(process.argv);

  let pages = program__default['default'].pages || "";

  if (pluginOptions.pages) {
    pages = `${pages},${pluginOptions.pages}`;
  }

  let ignore = program__default['default'].ignore || "";
  if (pluginOptions.ignore) {
    ignore = `${ignore},${pluginOptions.ignore}`;
  }

  return Object.assign({}, defaultOptions, pluginOptions, { pages, ignore });
}

function checkOptions(options) {
  if (options.hasOwnProperty("pages") && !lodash.isString(options.pages)) {
    console.log(
      "pages 必须为string类型，请检查配置！(pages`s type should be a string)"
    );
    process.exit(1);
  }
  if (options.hasOwnProperty("ignore") && !lodash.isString(options.ignore)) {
    console.log(
      "ignore 必须为string类型，请检查配置！(ignore`s type should be a string)"
    );
    process.exit(1);
  }
  if (
    options.hasOwnProperty("defaultTitle") &&
    !lodash.isString(options.defaultTitle)
  ) {
    console.log(
      "defaultTitle 必须为string类型，请检查配置！(defaultTitle`s type should be a string)"
    );
    process.exit(1);
  }
  if (
    options.hasOwnProperty("htmlOutputDir") &&
    !lodash.isString(options.htmlOutputDir)
  ) {
    console.log(
      "htmlOutputDir 必须为string类型，请检查配置！(htmlOutputDir`s type should be a string)"
    );
    process.exit(1);
  }
  if (
    options.hasOwnProperty("pageTitle") &&
    !lodash.isString(options.pageTitle) &&
    !lodash.isObject(options.pageTitle)
  ) {
    console.log(
      "pageTitle 必须为{string|object}类型，请检查配置！(pageTitle`s type should be a {string|object})"
    );
    process.exit(1);
  }
  if (
    options.hasOwnProperty("HtmlWebpackPluginOptions") &&
    !lodash.isFunction(options.HtmlWebpackPluginOptions) &&
    !lodash.isObject(options.HtmlWebpackPluginOptions)
  ) {
    console.log(
      "HtmlWebpackPluginOptions 必须为{function|object}类型，请检查配置！(HtmlWebpackPluginOptions`s type should be a {function|object})"
    );
    process.exit(1);
  }
}

/**
 * 移除原有的 HTMLWebpackPlugin和 ManifestPlugin
 * @param {object} webpackConfig
 */
function removePlugin(webpackConfig) {
  const HtmlWebpackPlugin = {
    plugin: {},
    config: {},
  };
  const ManifestPlugin = {
    plugin: {},
    config: {},
  };
  webpackConfig.plugins = webpackConfig.plugins.filter((item) => {
    if (item.constructor.name === "HtmlWebpackPlugin") {
      HtmlWebpackPlugin.plugin = item.constructor;
      HtmlWebpackPlugin.config = item.options;
      return false;
    }
    if (item.constructor.name === "ManifestPlugin") {
      ManifestPlugin.plugin = item.constructor;
      ManifestPlugin.config = item.opts;
      return false;
    }

    return true;
  });
  return { HtmlWebpackPlugin, ManifestPlugin };
}

let config = null;
let titleMap = null;

/**
 * 遍历指定目录
 * @param {*} pagePath 遍历的目录
 * @param {*} dir
 */
function getPagesInfo(pagePath, dir = "") {
  if (dir) {
    // 忽略的页面
    if (
      config.pagesRegexp.ignore.length > 0 &&
      config.pagesRegexp.ignore.some(
        (item) => !!item.exec(dir.replace(/\\/g, "/"))
      )
    ) {
      return [];
    }
    // 指定的页面
    if (
      config.pagesRegexp.pages.length > 0 &&
      !config.pagesRegexp.pages.some(
        (item) => !!item.exec(dir.replace(/\\/g, "/"))
      )
    ) {
      return [];
    }
  }

  const fileList = fs__default['default'].readdirSync(pagePath);
  const all = [];
  const directories = [];

  fileList.forEach((fileName) => {
    if (!fileName.startsWith(".")) {
      all.push(fileName);
      if (fs__default['default'].statSync(path__default['default'].resolve(pagePath, fileName)).isDirectory()) {
        directories.push(fileName);
      }
    }
  });
  // 文件夹中存在文件
  if (directories.length !== all.length && dir) {
    // 如果 文件夹中存在index.js文件 表示这是个页面
    if (fs__default['default'].existsSync(path__default['default'].resolve(config.paths.appSrc, dir, "index.js"))) {
      const title = getPageTitle(dir);
      return {
        name: dir,
        dir,
        title,
        entry: path__default['default'].resolve(config.paths.appSrc, dir, "index.js"),
      };
    }
    return [];
  }

  // 返回这个文件夹下 所有页面的信息
  return lodash.flatten(
    directories.map((fileName) => {
      const filePath = path__default['default'].resolve(pagePath, fileName);
      return getPagesInfo(
        filePath,
        path__default['default'].relative(config.paths.appSrc, filePath)
      );
    })
  );
}

/**
 * 获取页面的title
 * @param {string} dir
 */
function getPageTitle(dir) {
  if (typeof config.options.pageTitle === "string") {
    return config.options.pageTitle;
  }
  if (typeof config.options.pageTitle === "object") {
    const match1 = pathToRegexp.match(dir.replace(/\\/g, "/"), {
      decode: decodeURIComponent,
    });
    if (!titleMap) {
      titleMap = Object.entries(config.options.pageTitle);
    }
    const title = titleMap.find((item) => {
      return match1(item[0]);
    });
    if (title) {
      return title[1];
    }
  }
  return config.options.defaultTitle;
}

function getPages(initConfig, pagePath) {
  config = initConfig;
  return getPagesInfo(pagePath);
}

const pages = [];

/**
 * 生成用于匹配指定页面和忽略页面的Regexp
 * @param {Object} pluginOptions
 */
function getPagesRegexp(pluginOptions) {
  const pages = [];
  const ignore = [];

  if (pluginOptions.pages) {
    pluginOptions.pages.split(",").forEach((item) => {
      pages.push(...getPathRegexp(item));
    });
  }

  if (pluginOptions.ignore) {
    pluginOptions.ignore.split(",").forEach((item) => {
      if (item) {
        ignore.push(pathToRegexp.pathToRegexp(item));
      }
    });
  }

  return { pages, ignore };
}

/**
 * 指定页面的时候 其上级文件夹页面也需要存在
 * @param {string} path
 */
function getPathRegexp(path) {
  const regexpList = [];
  if (path) {
    let basePath = "";
    path.split("/").forEach((item) => {
      let localPath = item;
      if (basePath) {
        localPath = `${basePath}/${item}`;
      }
      if (!pages.includes(localPath)) {
        regexpList.push(pathToRegexp.pathToRegexp(localPath));
        pages.push(localPath);
      }
      basePath = localPath;
    });
  }
  return regexpList;
}

function getWebpackConfig(
  pages = [],
  HtmlWebpackPlugin = {},
  ManifestPlugin = {},
  pluginOptions
) {
  const plugins = [];
  const entry = {};
  const isDev = craco.whenDev(() => true, false);

  let customConfig = {};

  let isFun = false;
  if (lodash.isFunction(pluginOptions.HtmlWebpackPluginOptions)) {
    isFun = true;
  } else if (lodash.isObject(pluginOptions.HtmlWebpackPluginOptions)) {
    customConfig = pluginOptions.HtmlWebpackPluginOptions;
  }

  pages.forEach((item) => {
    entry[item.name] = [
      isDev && require.resolve("react-dev-utils/webpackHotDevClient"),
      item.entry,
    ].filter(Boolean);
    let config = Object.assign({}, HtmlWebpackPlugin.config, customConfig, {
      title: item.title,
      chunks: [item.name],
      filename: `${pluginOptions.htmlOutputDir}${path.sep}${item.dir}.html`,
    });
    if (isFun) {
      config = pluginOptions.HtmlWebpackPluginOptions(config);
      if (!lodash.isObject(config)) {
        console.error("HtmlWebpackPluginOptions 应该返回一个 Object");
        process.exit(1);
      }
    }

    plugins.push(new HtmlWebpackPlugin.plugin(config));
  });

  plugins.push(
    new ManifestPlugin.plugin(
      Object.assign({}, ManifestPlugin.config, {
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = [];
          Object.values(entrypoints).forEach((entrypoint) => {
            entrypointFiles.push(
              ...entrypoint.filter((fileName) => !fileName.endsWith(".map"))
            );
          });

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      })
    )
  );

  return {
    plugins,
    entry,
  };
}

/**
 * 生成索引页面
 * @param {Object} HtmlWebpackPlugin webpack插件
 * @param {Array} pages 页面列表
 */
function getIndexPage(HtmlWebpackPlugin, pages) {
  return new HtmlWebpackPlugin.plugin(
    Object.assign({}, HtmlWebpackPlugin.config, {
      chunks: [],
      title: "index/索引页面",
      templateContent() {
        let html = "<ul>";
        pages.forEach((item) => {
          if (item.options) {
            html += `<li><a href="${item.options.filename}">${item.options.title}(${item.options.filename})</a></li>`;
          }
        });
        return `${html}</ul>`;
      },
    })
  );
}

/* craco-plugin-multipage */

module.exports = {
  overrideWebpackConfig: ({
    webpackConfig,
    cracoConfig,
    pluginOptions,
    context: { paths },
  }) => {
    const options = getOptions(paths, pluginOptions);
    const pagesRegexp = getPagesRegexp(options);

    // 移除原有的 plugin
    const { HtmlWebpackPlugin, ManifestPlugin } = removePlugin(webpackConfig);
    const pages = getPages({ pagesRegexp, paths, options }, paths.appSrc);
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
    craco.whenDev(() => {
      webpackConfig.output.filename = "static/js/[name].bundle.js";
      // 添加索引页面
      webpackConfig.plugins.unshift(getIndexPage(HtmlWebpackPlugin, plugins));
    });

    // Always return the config object.
    return webpackConfig;
  },
};
