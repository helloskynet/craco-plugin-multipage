const fs = require("fs");
const path = require("path");
const { flatten } = require("lodash");
const { match } = require("path-to-regexp");

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

  const fileList = fs.readdirSync(pagePath);
  const all = [];
  const directories = [];

  fileList.forEach((fileName) => {
    if (!fileName.startsWith(".")) {
      all.push(fileName);
      if (fs.statSync(path.resolve(pagePath, fileName)).isDirectory()) {
        directories.push(fileName);
      }
    }
  });
  // 文件夹中存在文件
  if (directories.length !== all.length && dir) {
    // 如果 文件夹中存在index.js文件 表示这是个页面
    if (fs.existsSync(path.resolve(config.paths.appSrc, dir, "index.js"))) {
      const title = getPageTitle(dir);
      return {
        name: dir,
        dir,
        title,
        entry: path.resolve(config.paths.appSrc, dir, "index.js"),
      };
    }
    return [];
  }

  // 返回这个文件夹下 所有页面的信息
  return flatten(
    directories.map((fileName) => {
      const filePath = path.resolve(pagePath, fileName);
      return getPagesInfo(
        filePath,
        path.relative(config.paths.appSrc, filePath)
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
    const match1 = match(dir.replace(/\\/g, "/"), {
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

module.exports = getPages;
