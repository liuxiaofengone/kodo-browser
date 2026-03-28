const gulp = require("gulp"),
  plugins = require("gulp-load-plugins")({
    lazy: false
  }),
  packager = require('electron-packager'),
  createDMG = require('electron-installer-dmg'),
  archiver = require('archiver'),
  fs = require("fs"),
  path = require("path"),
  pkg = require("./package");

const NAME = 'Kodo Browser';
const KICK_NAME = 'kodo-browser';
const VERSION = pkg.version;
const ELECTRON_VERSION = "18.3.3";
const ROOT = __dirname;
// https://github.com/qiniu/kodo-browser/issues/135
const WIN_NO_SANDBOX_NAME = "no-sandbox-shortcut.cmd";
const LINUX_DESKTOP_FILE = "create-desktop-file.sh";
const BRAND = `${ROOT}/src/renderer/static/brand`;
const DIST = `${ROOT}/dist`;
const TARGET = `${ROOT}/build`;
const RELEASE = `${ROOT}/releases`;

const packagerOptions = {
  dir: DIST,
  name: NAME,
  asar: false,
  out: TARGET,
  overwrite: true,
  download: {
    mirrorOptions: 'https://repo.huaweicloud.com/electron/'
  },
  appVersion: VERSION,
  appCopyright: "",
  electronVersion: ELECTRON_VERSION,
  packageManager: "yarn"
};

[DIST, TARGET, RELEASE].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

gulp.task("winarm64", done => {
  console.log(`--package ${NAME}-win32-arm64`);
  const targetDir = path.resolve(TARGET, `./${NAME}-win32-arm64`);

  plugins.run(`rm -rf ${targetDir}`).exec(() => {
    let options = Object.assign({}, packagerOptions);
    options.platform = "win32";
    options.arch = "arm64";
    options.icon = `${BRAND}/qiniu.png`;

    packager(options).then((paths) => {
      fs.copyFileSync(
        path.resolve(ROOT, `./${WIN_NO_SANDBOX_NAME}`),
        path.resolve(targetDir, `./${WIN_NO_SANDBOX_NAME}`)
      );
      console.log("--done");
      done();
    }, (errs) => {
      console.error(errs);
    });
  });
});

gulp.task("winarm64zip", done => {
  console.log(`--package ${KICK_NAME}-win32-arm64-v${VERSION}.zip`);
  const inputDir = `${TARGET}/${NAME}-win32-arm64`;
  const outputZip = fs.createWriteStream(`${TARGET}/${KICK_NAME}-win32-arm64-v${VERSION}.zip`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  archive.pipe(outputZip);
  archive.directory(inputDir, false);
  archive.finalize().then(done);
});

