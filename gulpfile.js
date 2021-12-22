const { src, dest } = require("gulp");
const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const del = require("del");
const scss = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer"); //not working
const group_media = require("gulp-group-css-media-queries");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const webpHTML = require("gulp-webp-html");
const webpcss = require("gulp-webpcss"); //works not completely
const svgSprite = require("gulp-svg-sprite");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");

const fs = require("fs");

let project_folder = "dist"; //The final folder that will be given to a client
let source_folder = "#src"; //folder for work
//pathes to all the folders
let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], //исключаем файлы начинающиеся на "_"
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", //**-all subfolders
        fonts: source_folder + "/fonts/*ttf", //ttf - the needed font format
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", //**-all subfolders
    },
    clean: "./" + project_folder + "/",
};

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        notify: false,
    });
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webpHTML())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream()); //refresh the page
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded",
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserlist: ["last 15 versions"],
                cascade: false,
            })
        )
        .pipe(webpcss())
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css",
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream()); //refresh the page
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js",
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream()); //refresh the page
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70,
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewbox: false }],
                interlaced: true,
                optimizationLevel: 3,
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream()); //refresh the page
}

function fonts() {
    src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
    return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

gulp.task("otf2ttf", function() {
    return src([source_folder + "/fonts/*.otf"])
        .pipe(
            fonter({
                formats: ["ttf"],
            })
        )
        .pipe(dest(source_folder + "/fonts/"));
});

//We do not use this taskk all the time. To use it - gulp svgSprite
gulp.task("svgSprite", function() {
    return gulp
        .src([source_folder + "/iconsprite/*.svg"])
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: "../icons/icons.svg", //sprite file name
                        example: true,
                    },
                },
            })
        )
        .pipe(dest(path.build.img));
});

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync); //Сценарий выполнения функций автоматизации (самая важная часть)

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;