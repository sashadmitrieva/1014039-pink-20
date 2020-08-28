const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();

const csso = require ("gulp-csso");
const rename = require ("gulp-rename");
const imagemin = require ("gulp-imagemin");
const svgo = require ("gulp-svgo");
const webp = require ("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const htmlmin = require("gulp-htmlmin");

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({quality: 90, progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
}

exports.images = images;

// WebP

const addWebp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"))
}

exports.webp = addWebp;

// Sprite

const sprite = () => {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Html

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true}))
    .pipe(gulp.dest("build"))
    .pipe(sync.stream());
}

exports.html = html;

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Copy

const copy = () => {
    return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**",
      "source/js/**",
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// // Run build

const build = gulp.series (
  clean,
  copy,
  styles,
  images,
  addWebp,
  sprite,
  html
);

exports.build = build;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  build, server, watcher
);
