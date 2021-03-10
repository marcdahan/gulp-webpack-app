const fileswatch = 'html,htm,txt,json,md,woff2';

const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const bssi = require('browsersync-ssi');
const ssi = require('ssi');
const webpack = require('webpack-stream');
const sass = require('gulp-sass');
const sassglob = require('gulp-sass-glob');
const cleancss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

const hash_src = require('gulp-hash-src');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
      middleware: bssi({ baseDir: 'app/', ext: '.html' }),
    },
    ghostMode: { clicks: false },
    notify: false,
    online: false,
  });
}

function scripts() {
  return src(['app/js/*.js'])
    .pipe(
      webpack({
        mode: 'production',
        performance: { hints: false },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules)/,
              loader: 'babel-loader',
              query: {
                presets: ['@babel/env'],
                plugins: ['babel-plugin-root-import'],
              },
            },
          ],
        },
      }),
    )
    .on('error', function handleError() {
      this.emit('end');
    })
    .pipe(rename('app.min.js'))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function styles() {
  return src([`app/scss/*.*`])
    .pipe(eval(sassglob)())
    .pipe(eval(sass)())
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(
      cleancss({
        level: { 1: { specialComments: 0 } },
        format: 'beautify',
      }),
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function images() {
  return src(['app/img/**/*'])
    .pipe(newer('app/image'))
    .pipe(imagemin())
    .pipe(dest('app/image'))
    .pipe(browserSync.stream());
}

function startwatch() {
  watch(`app/styles/scss/**/*`, { usePolling: true }, styles);
  watch('app/js/**/*.js', { usePolling: true }, scripts);
  watch('app/img/**/*.{jpg,jpeg,png,webp,svg,gif}', { usePolling: true }, images);
  watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload);
}

function cleandist() {
  return del('dist/**/*', { force: true });
}

function buildcopy() {
  return src(['{app/js,app/css}/*.min.*', 'app/image/**/*.*', '!app/img/**/*', 'app/fonts/**/*'], {
    base: 'app/',
  }).pipe(dest('dist'));
}

async function buildhtml() {
  let includes = new ssi('app/', 'dist/', '/**/*.html');
  includes.compile();
  del('dist/parts', { force: true });
}

function hash() {
  return src(['./dist/**/*.html', './dist/**/*.css'])
    .pipe(hash_src({ build_dir: './dist', src_path: './dist' }))
    .pipe(dest('./dist'));
}

exports.scripts = scripts;

exports.styles = styles;

exports.images = images;

exports.cleandist = cleandist;

exports.assets = series(scripts, styles, images);

exports.build = series(cleandist, scripts, styles, images, buildcopy, buildhtml, hash);

exports.default = series(scripts, styles, images, parallel(browsersync, startwatch));
