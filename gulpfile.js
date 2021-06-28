const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  });
}

function cleanDist() {
  return del('dist');
}

function images() {
  return src('app/images/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest('dist/images'));
}

function styles() {
  return src('app/sass/style.sass')
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true,
      })
    )
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function build() {
  return src(
    [
      'app/css/style.css',
      'app/fonts/**/*',
      'app/js/main.js',
      'app/*.html',
    ],
    { base: 'app' }
  ).pipe(dest('dist'));
}

function watching() {
  watch(['app/sass/**/*.sass'], styles);
  watch(['app/js/**/*.js']).on('change', browserSync.reload);
  watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, browsersync, watching);
