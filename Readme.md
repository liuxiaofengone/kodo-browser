# Kodo Browser（Windows ARM64 适配版）

本仓库基于 [qiniu/kodo-browser](https://github.com/qiniu/kodo-browser) 二次开发，在保留全部原始功能的基础上，新增了对 **Windows ARM64 架构**的原生打包支持，并修复了若干国内环境下的构建兼容性问题。

KODO Browser 参考 [OSS Browser](https://github.com/aliyun/oss-browser.git) 设计，提供类似 Windows 资源管理器的使用体验，支持文件浏览、上传/下载、断点续传等功能，底层使用 [React](https://reactjs.org/) + [Electron](https://www.electronjs.org/) 构建。

---

## 相对于原始项目的改动

| # | 改动内容 | 说明 |
|---|---------|------|
| 1 | **新增 Windows ARM64 打包目标** | 在 `gulpfile.js` 中新增 `winArm64` / `winArm64zip` Gulp 任务，使用 Electron 18.3.3，适用于 Surface Pro X/9 等 ARM 设备 |
| 2 | **放宽 Node.js 版本限制** | `package.json` 的 `engines.node` 从 `^14 \|\| ^16` 改为 `>=14`，支持 Node.js 18/20 LTS |
| 3 | **修复 Node.js 17+ Webpack 构建兼容性** | `build` / `dev` / `watch` 脚本均添加 `NODE_OPTIONS=--openssl-legacy-provider`，解决 OpenSSL 3 兼容报错 |
| 4 | **配置 Electron 国内下载镜像** | 新增 `.npmrc`，设置 `electron_mirror=https://npmmirror.com/mirrors/electron/`，避免 `yarn install` 时因 Electron 二进制下载失败而中断 |
| 5 | **移除 GitHub CI/CD** | 删除 `.github/` 目录下的 GitHub Actions 工作流，避免推送后触发不必要的 CI 流程 |

---

## 功能介绍

```
Kodo Browser
├── 登录：支持 AccessKey / SecretKey 登录
├── Bucket 管理：新建、删除 Bucket
│   └── 文件管理：目录与文件的增删改查、复制、预览
│       └── 传输任务管理：上传/下载，断点续传
└── 地址栏：支持 kodo://bucket/object 协议、浏览历史前进后退、书签
```

官方使用手册：https://developer.qiniu.com/kodo/tools/5972/kodo-browser

---

## 开发环境搭建

### 1. 安装 Node.js（>=14，推荐最新 LTS）

官网：https://nodejs.org/

### 2. 安装 yarn

```bash
npm install -g yarn
```

### 3. Windows 额外依赖

需要先安装 [git](https://git-scm.com/) 和 [Chocolatey](https://chocolatey.org/)，然后执行：

```bash
choco install python vcredist-all make
```

### 4. 克隆代码并安装依赖

```bash
git clone https://github.com/liuxiaofengone/kodo-browser-windowsarm64.git
cd kodo-browser-windowsarm64
yarn install
```

> 国内网络环境下，`.npmrc` 已配置 npmmirror 镜像，Electron 二进制包会自动从国内节点下载。

### 5. 开发模式运行

```bash
make run
```

开发模式下，源码修改会自动触发前端重新构建。调试界面：macOS 按 `Cmd+Option+I`，Windows/Linux 按 `F12`。

### 6. 构建前端代码

```bash
yarn build
```

### 7. 打包发行版

```bash
make winArm64   # Windows ARM64（新增，适用于 Surface Pro X/9 等 ARM 设备）
make win64      # Windows x64
make win32      # Windows x86
make mac        # macOS
make dmg        # macOS DMG 安装包
make linux64    # Linux x64
make linux32    # Linux x86
make all        # 所有平台
```

> **Windows 用户若未安装 make**，可直接使用等效 yarn 命令（PowerShell 示例）：
> ```powershell
> yarn build; yarn build:winArm64; yarn pkg:winArm64
> ```

---

## 代码结构

```
kodo-browser/
├── build/           # 打包后的应用程序
├── dist/            # Webpack 构建输出
├── gulpfile.js      # Gulp 打包任务（含新增的 winArm64 目标）
├── package.json
├── .npmrc           # Electron 国内镜像配置（新增）
├── src/
│   ├── common/      # 通用模块（传输任务、七牛 SDK 封装等）
│   ├── main/        # Electron 主进程
│   └── renderer/    # 前端渲染进程（React）
└── webpack/         # Webpack 配置
```

---

## 私有云配置

将配置文件放在 `$HOME/.kodo-browser-v2/config.json`（Windows 路径：`C:\Users\<用户名>\.kodo-browser-v2\config.json`）：

```json
{
    "regions": [
        { "id": "cn-east-1",       "endpoint": "https://s3-cn-east-1.qiniucs.com" },
        { "id": "cn-north-1",      "endpoint": "https://s3-cn-north-1.qiniucs.com" },
        { "id": "cn-south-1",      "endpoint": "https://s3-cn-south-1.qiniucs.com" },
        { "id": "us-north-1",      "endpoint": "https://s3-us-north-1.qiniucs.com" },
        { "id": "ap-southeast-1",  "endpoint": "https://s3-ap-southeast-1.qiniucs.com" }
    ],
    "uc_url": "https://uc.qbox.me"
}
```

---

## OEM 定制

编辑 `src/renderer/customize.ts` 后重新打包，可定制以下功能：

- 禁止创建 Bucket
- 禁止删除 Bucket
- 禁止使用自有域名
- 配置升级检测地址

---

## 启动配置项（launchConfig.json）

将 `launchConfig.json` 放在可执行程序同级目录（Windows/Linux：`kodo-browser/`，macOS：`Kodo Browser.app/Contents/MacOS/`），可在启动时覆盖部分默认行为。格式参见 [launchConfig.schema.json](launchConfig.schema.json)，支持以下配置：

- `preferredEndpointType`：登录默认服务端类型（`public` / `private`）
- `defaultPrivateEndpointConfig`：私有云默认地址（`ucUrl`、`regions`）
- `preferenceValidators`：上传/下载并发数等参数的校验范围
- `disable.nonOwnedDomain`：禁止使用非自有域名
- `baseShareUrl`：分享链接基础 URL

示例：

```json
{
  "preferredEndpointType": "private",
  "defaultPrivateEndpointConfig": {
    "ucUrl": "http://uc.example.com",
    "regions": [
      { "id": "cn-east-1", "label": "华东", "endpoint": "http://s3.example.com" }
    ]
  }
}
```

---

## 上游项目

- 原始仓库：[qiniu/kodo-browser](https://github.com/qiniu/kodo-browser)

## License

[Apache License 2.0](LICENSE)
