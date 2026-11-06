# 测量学局劲工具 · 网页轻量版

纯静态网页版测量记录表工具。无需安装、无需后端，打开即用；所有数据只保存在本机浏览器里，不向任何服务器发送。

桌面版（Windows，Tauri v2）：[survey-jujin-taibai](https://github.com/JNGKZbird/survey-jujin-taibai)

## 功能

- 表一 导线、表二 水准、表三 角度记录
- 表四 导线汇总、表五 水准汇总、表六 三角高程
- 表G 导线计算
- 七表联立映射
- 多项目、项目重命名 / 复制 / 删除
- JSON 单表、七表、全部项目导入导出
- 打印 / 另存为 PDF
- 浅色、深色、跟随系统主题
- 误差色分档

## 直接使用

直接打开 `index.html` 即可。没有构建步骤，没有外部依赖，也不会发起网络请求。

## 托管

本仓库根目录就是静态站点，可直接部署到 GitHub Pages、Gitee Pages 或任意静态服务器。若使用 GitHub Pages，仓库根目录已经带有 `.nojekyll`。

## 数据与备份

数据保存在浏览器的 `localStorage` 中，键名为 `survey-jujin.dev.v1`。

- 刷新、关闭浏览器再打开，数据通常还在。
- 清理浏览器站点数据、使用无痕模式、换浏览器或换设备，数据会丢失。
- 浏览器在磁盘压力下也可能回收站点数据；页面首次交互时会请求 `navigator.storage.persist()`，但这只能降低概率，不能阻止手动清理。

**唯一可靠的备份是导出 JSON。** 项目菜单 →「导出全部项目」；恢复时用「导入」或把 `.json` 文件拖进页面。

## 生成单文件版

如果需要把整个工具作为一个 HTML 文件分发：

```text
node tools/build-single.js
```

产物在 `dist/测量学局劲-轻量版.html`，脚本、样式和许可证全文都会内嵌，可直接单独发送或双击打开。

## 目录

```text
index.html              页面入口
assets/                 样式、计算、存储与界面脚本
tools/build-single.js   单文件版构建脚本
LICENSE                 木兰宽松许可证第 2 版
```

## 维护方式

本仓库的 `index.html` 与 `assets/` 由主项目构建生成：主项目先执行 `pnpm build:web` 生成 `dist-web/`，再执行 `pnpm sync:lite-repo` 同步到这里。日常修改请回主项目改源码；如果直接改本仓库，下次同步会被覆盖。单独 fork 使用不受影响。

## 许可

本软件以 **木兰宽松许可证，第 2 版（Mulan PSL v2）** 开源，完整文本见 `LICENSE`。本仓库不包含第三方字体、公式库或其他第三方资源。
