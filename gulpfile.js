"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var del = require("del");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var server = require("browser-sync").create();
var reload = server.reload;
var htmlmin = require("gulp-htmlmin");
var uglify = require('gulp-uglify');

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("html", "reload"));
});

gulp.task("reload", function (done) {
  server.reload();
  done();
});

gulp.task ("copy",function(){
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function (){
  return del ("build");
});

gulp.task("images", function(){
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe( imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.svgo()
  ]))
  .pipe (gulp.dest("build/img"));
});

gulp.task("webp", function(){
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 80}))
  .pipe(gulp.dest("build/img"));
});

gulp.task("js",function(){
  return gulp.src("source/js/*.js")
  .pipe(uglify())
  .pipe(rename("script-min.js"))
  .pipe(gulp.dest("build/js"));
});

gulp.task("html", function(){
  return gulp.src("source/*.html")
    .pipe(htmlmin({
      collapseWhitespace: true
    }))

    .pipe(gulp.dest("build"));
  });

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "html",
  "webp",
  "images",
  "js"
  ));

gulp.task("start", gulp.series(
  "build",
  "server"
  ));
