import {src, dest, series, watch, parallel} from "gulp"
import minify from "gulp-minify"
import webpack from "webpack-stream"
import sass from "gulp-sass"
import autoprefixer from "gulp-autoprefixer"
import sourcemaps from "gulp-sourcemaps"
import del from "delete"
import {DEV_FOLDER, PROD_FOLDER, ENV} from "./config";
import {webpackConfig} from "./webpack.config";
import browserSync from "browser-sync"
import gulpif from "gulp-if"
import imagemin from "gulp-imagemin"

browserSync.create()

function clear(done) {
    del(["dist"])
    done()
}

function javascript() {
    return src(DEV_FOLDER + '**/*.js')
        .pipe(webpack(webpackConfig))
        .pipe(minify({
            ext: {
                min: '.min.js'
            },
            ignoreFiles: ['-min.js']
        }))
        .pipe(dest(PROD_FOLDER + "js/"))
        .pipe(gulpif(ENV !== "production", browserSync.stream()));
}

function scss() {
    return src(DEV_FOLDER + '/scss/app.scss')
        .pipe(sourcemaps.init() )
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(ENV === "production", autoprefixer()))
        .pipe(sourcemaps.write('.') )
        .pipe(minify({
            ext: {
                min: '.min.css'
            },
            ignoreFiles: ['-min.css']
        }))
        .pipe(dest(PROD_FOLDER + "/css"))
        .pipe(gulpif(ENV !== "production", browserSync.stream()));
}

function assets() {
    return src(DEV_FOLDER + '/images/*')
        .pipe(imagemin())
        .pipe(dest(PROD_FOLDER + '/images/'))
        .pipe(gulpif(ENV !== "production", browserSync.stream()));
}

function video() {
    return src(DEV_FOLDER + '/videos/*')
        .pipe(dest(PROD_FOLDER + '/videos/'))
        .pipe(gulpif(ENV !== "production", browserSync.stream()));
}

function fonts() {
    return src(DEV_FOLDER + '/fonts/*')
        .pipe(dest(PROD_FOLDER + '/fonts/'))
        .pipe(gulpif(ENV !== "production", browserSync.stream()));
}

function html() {
    return src(DEV_FOLDER + '**/*.+(html|php)')
        .pipe(dest(PROD_FOLDER))
        .pipe(gulpif(ENV !== "production", browserSync.stream()));
}

function dev() {
    watch(DEV_FOLDER+'**/*.+(html|php)', { ignoreInitial: false }, html)
    watch(DEV_FOLDER +'**/*.scss', { ignoreInitial: false }, scss);
    watch(DEV_FOLDER +'**/*.js', { ignoreInitial: false }, javascript);
    watch(DEV_FOLDER +'/images/*', { ignoreInitial: false }, assets);
    watch(DEV_FOLDER +'/videos/*', { ignoreInitial: false }, video);
    watch(DEV_FOLDER +'/fonts/*', { ignoreInitial: false }, fonts);
}

function sync() {
    browserSync.init({
        server: {
            baseDir: PROD_FOLDER,
            index: 'index.html'
        },
        port: 8080,
        open: false,
        notify: false,
        injectChanges: true
    });
}

exports.default = parallel(series(assets,fonts, video, dev), sync)
exports.clear = clear
exports.build = series(clear, html, scss, javascript, assets, fonts, video)