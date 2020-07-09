const { series, watch, parallel, src, dest } = require("gulp")

const clean = require("gulp-clean")
const terser = require("gulp-terser")
const rename = require("gulp-rename")
const sass = require("gulp-dart-sass")
const htmlmin = require("gulp-htmlmin")
const webpack = require("webpack-stream")
const prettier = require("gulp-prettier")
const css_clean = require("gulp-clean-css")
const autoprefixer = require("gulp-autoprefixer")
const browserSync = require("browser-sync").create()

/**
 * My local constants and paths
 */
const myfiles = {
  src: "./src",
  html: "./src/**/*.html",
  js: "./src/**/*.js",
  sass: "./src/assets/**/*.sass",
  // 
  // Webpack
  webpack_entry: "./src/main.js",
  webpack_output: "js/bundle.min.js",
  //
  // Output files
  dest: "./build",
}

/**
 * Local server with Browser Sync
 */
const serve = () => {
  browserSync.init({
    server: {
      baseDir: myfiles.dest,
    },
  })
}

/**
 * Minify HTML files
 */
const compress_html = () => {
  console.log("Compressing HTML files...")
  const h = htmlmin({ collapseWhitespace: true })
  return src(myfiles.html)
    .pipe(h)
    .pipe(dest(myfiles.dest))
    .pipe(browserSync.stream())
}

/**
 * Clean build files
 */
const clean_files = () => {
  console.log("Cleaning files...")
  return src(myfiles.dest, {
    read: false,
    allowEmpty: true,
  }).pipe(clean())
}

/**
 * Compile SASS files
 */
const compile_sass = callback => {
  console.log("Compiling SASS...")

  const s = sass({ outputStyle: "compressed" })
  const output = "css/bundle.min.css"

  src(myfiles.sass)
    .pipe(s)
    .pipe(autoprefixer())
    .pipe(css_clean({ compatibility: "ie8" }))
    .pipe(rename(output))
    .pipe(dest(myfiles.dest))
    .pipe(browserSync.stream())

  callback()
}

/**
 * Transpile from babel to ES6 JavaScript
 */
const bundle = () => {
  console.log("Bundle Javascipt files")

  return src(myfiles.webpack_entry)
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(terser())
    .pipe(rename(myfiles.webpack_output))
    .pipe(dest(myfiles.dest))
    .pipe(browserSync.stream())
}

/**
 * Format JS files
 */
const format = () => {
  console.log("Formatting with prettier")
  const p = prettier({
    tabWidth: 2,
    printWidth: 60,
    semi: false,
    singleQuote: false,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "avoid",
    endOfLine: "lf",
  })
  return src(myfiles.js).pipe(p).pipe(dest(myfiles.src))
}

const watch_files = () => {
  // Watch javascript files
  watch(myfiles.js, { ignoreInitial: false }, bundle)
  // Watch sass files
  watch(myfiles.sass, { ignoreInitial: false }, compile_sass)
  // Watch html
  watch(myfiles.html, { ignoreInitial: false }, compress_html)
}

const build = series(
  clean_files,
  format,
  bundle,
  parallel(compile_sass, compress_html)
)

exports.serve = serve
exports.clean = clean_files
exports.format = format
exports.bundle = bundle
exports.sass = compile_sass
exports.html = compress_html
//
// Prod
exports.build = build
//
// Dev
exports.dev = (series(build), parallel(serve, watch_files))
