# craco-plugin-multipage

Cracte-React-App craco 多页面插件

[Demo](https://github.com/helloskynet/react-multipage-demo)

## 使用 Usage

1. 创建 App

   `npx create-react-app my-app`

1. 安装 @craco/craco

   能看到这个插件，你一定也知道@craco/craco。

   安装[@craco/craco](https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#installation)

   ```
   npm i -D @craco/craco
   ```

   安装之后记得根据@craco/craco 文档，修改 package.json 中的 scripts

1. 安装 craco-plugin-multipage

   ```
   npm i -D craco-plugin-multipage
   ```

1. 配置@craco/craco

   添加 craco.config.js

   ```js
   // craco.config.js
   const CracoPluginMultipage = require("craco-plugin-multipage");

   module.exports = {
     plugins: [
       {
         plugin: CracoPluginMultipage,
         options: {},
       },
     ],
   };
   ```

1. 调整目录结构

   由

   ```
   my-app
   ├── node_modules
   ├── craco.config.js
   ├── package.json
   └── src
       ├── App.css
       ├── App.js
       ├── index.js
       ...
   ```

   调整为

   ```
   my-app
   ├── node_modules
   ├── craco.config.js
   ├── package.json
   └── src
       ├── page1
            ├── App.css
            ├── App.js
            ├── index.js
            ...
       ├── page2
            ├── App.css
            ├── App.js
            ├── index.js
            ...
       └── page3
           ├── page4
                ├── App.css
                ├── App.js
                ├── index.js
                ...
           └── page5
                ├── App.css
                ├── App.js
                ├── index.js
                ...
   ```

   **src 文件夹下包含 index.js 的会被认为是一个页面** 当一个文件夹包含 index.js 时，其内部仍存在页面时，其内部的页面会被忽略；例如，如下目录结构，page2 将会被忽略。如果一个文件夹同时包含文件和文件夹且不存在 index.js 文件，则整个文件夹都会被忽略。

   ```
   my-app
   ├── node_modules
   ├── craco.config.js
   ├── package.json
   └── src
     ├── page1
          ├── App.css
          ├── App.js
          ├── index.js
          ...
          ├── page2
                ├── App.css
                ├── App.js
                ├── index.js
                ...
   ```

1. 启动

   `npm run build / start`

## Options

### options

| 属性                     | type               | default     | desc                                                                                                                                                                                                                                                                                        |
| ------------------------ | ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| htmlOutputDir            | string             | "pages"     | html 的输出目录，相对于 build 目录                                                                                                                                                                                                                                                          |
| pages                    | string             | ""          | 指定启动的页面，默认全部，多个时用英文逗号分隔，支持命令行                                                                                                                                                                                                                                  |
| ignore                   | string             | ""          | 忽略的页面，优先级高于 pages，支持命令行。                                                                                                                                                                                                                                                  |
| pageTitle                | object             | {}          | 页面的 title 分页面配置                                                                                                                                                                                                                                                                     |
| defaultTitle             | String             | "React App" | 页面默认的 title，pageTitle 匹配不到或者未配置时使用。                                                                                                                                                                                                                                      |
| HtmlWebpackPluginOptions | {object\|Function} | {}          | HtmlWebpackPlugin 的配置，为 Object 时可以覆盖除 title、chunks、filename 之外的其他属性；为 Function 时,每个页面都会调用它，入参为原 HtmlWebpackPlugin 的 Config 需要返回一个新的 HtmlWebpackPlugin 的 Config，关于[HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin)配置 |

### htmlOutputDir

编译生成的 html 的输出目录，相对于 build 目录，默认为 pages。

### pages

指定编译的页面，多个页面时通过英文逗号分隔。

使用[Path-to-RegExp](https://github.com/pillarjs/path-to-regexp)匹配。

```js
// craco.config.js
const CracoPluginMultipage = require("craco-plugin-multipage");

module.exports = {
  plugins: [
    {
      plugin: CracoPluginMultipage,
      options: {
        pages: "page1,page3/page4",
      },
    },
  ],
};
```

也可以通过命令行指定编译的页面，命令行参数和 options 中的参数将会合并，无优先级区分。

```cmd
npm run build -- --pages page1,page3/(.*)
```

上面的命令将会会编译 page1 和 page3 目录下的 page4,page5

### ignore

指定无需编译的页面，多个页面时通过英文逗号分隔，规则同上。

```js
// craco.config.js
const CracoPluginMultipage = require("craco-plugin-multipage");

module.exports = {
  plugins: [
    {
      plugin: CracoPluginMultipage,
      options: {
        pages: "page1",
        ignore: "page3/(.*)",
      },
    },
  ],
};
```

优先级高于 pages ，故**ignore 和 pages 同时命中同一个页面时，该页面将会被忽略。** 也可以通过命令行指定，命令行参数和 options 中的参数将会合并。

```cmd
npm run build -- --pages page1,page3/(.*) --ignore page3/page4
```

上面的命令将会编译 page1 和 page3 目录下的 page5，而忽略 page3/page4。

### pageTitle 和 defaultTitle

页面的 title，默认为{}，pageTitle 如果页面未匹配到 title，则使用 defaultTitle。

```js
// craco.config.js
const CracoPluginMultipage = require("craco-plugin-multipage");

module.exports = {
  plugins: [
    {
      plugin: CracoPluginMultipage,
      options: {
         pageTitle: {
           page1: "1号页面",
           "page3/page4": "3/4号页面",
         },
         defaultTitle："React App"
      },
    },
  ],
};
```

要使用 title 属性，需要将模板 public/index.html 中的 title 部分修改为

```html
<title><%= htmlWebpackPlugin.options.title %></title>
```

### HtmlWebpackPluginOptions

HtmlWebpackPlugin 的配置，为 Object 时可以覆盖除 title、chunks、filename 之外的其他属性。

为 Function 时,每个页面都会调用它，入参为原 HtmlWebpackPlugin 的 Config 需要返回一个新的 HtmlWebpackPlugin 的 Config,可以覆盖所有的属性，关于[HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin)配置。

```js
// craco.config.js
const CracoPluginMultipage = require("craco-plugin-multipage");

module.exports = {
  plugins: [
    {
      plugin: CracoPluginMultipage,
      options: {
        HtmlWebpackPluginOptions: (config) => config,
      },
    },
  ],
};
```
