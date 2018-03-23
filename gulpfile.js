"use strict";

const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');

const config = require(path.join(__dirname, 'gulp-config.js'));

/*
* JavaScript Tasks
*/

gulp.task('minifyScripts', function(){
	return gulp.src(config.js.app_files)
		.pipe(concat(config.js.DIST_NAME + '.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.js.DEST_DIR));
});

/*
* Sass/Styles Tasks
*/
gulp.task('sass', function() {
    gulp.src(config.styles.SOURCE_DIR + '/**/*.scss')
        .pipe(sass(config.styles.sass_options).on('error', sass.logError))
        .pipe(gulp.dest(config.styles.DEST_DIR));
});


/*
* Watch tasks
*/

gulp.task('watchSass', ['sass'], function() {
    gulp.watch(config.styles.SOURCE_DIR + '/**/*.scss', ['sass']);
});

gulp.task('watchScripts', ['minifyScripts'], function(){
	gulp.watch(config.js.SOURCE_DIR + '/**/*.js', ['minifyScripts']);
});


/*
* Main gulp tasks
*/
gulp.task('watch', ['watchSass', 'watchScripts']);
gulp.task('build', ['minifyScripts', 'sass']);
gulp.task('default', ['build']);