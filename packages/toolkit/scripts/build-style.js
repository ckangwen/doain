import gulp from "gulp";
import autoprefixer from "gulp-autoprefixer";
import cleanCss from "gulp-clean-css";
import cssmin from "gulp-cssmin";
import gulpSass from "gulp-sass";
import dartSass from "sass";

const sass = gulpSass(dartSass);
export default function buildStyle(done) {
  gulp
    .src("../scss/index.scss")
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cleanCss())
    .pipe(cssmin())
    .pipe(gulp.dest("../styles"));

  done();
}
