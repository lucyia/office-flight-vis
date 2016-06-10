'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var webserver = require('gulp-webserver');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('default', ['webserver', 'watch']);

gulp.task('watch', ['styles', 'resources-scripts', 'custom-scripts'], function () {
	gulp.watch('./js/*.js', ['custom-scripts']);
	gulp.watch('./less/*.less', ['styles']);
});

gulp.task('webserver', function() {
  gulp.src('../dist')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

gulp.task('resources-scripts', function() {
	return gulp.src([
		'./node_modules/jquery/dist/jquery.js',
		'./node_modules/bootstrap/dist/js/bootstrap.js',
		'./node_modules/d3/d3.js',
		'./node_modules/d3-tip/index.js'
		])	
	.pipe(concat('resources.js'))		
	// add when ready for dist // .pipe(minify())
	.pipe(gulp.dest('../dist'));
});

gulp.task('custom-scripts', function() {
	return browserify({entries: './js/init.js', debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('custom.js'))
        .pipe(gulp.dest('../dist'));
});

gulp.task('styles', function() {
	return gulp.src([
		'./less/styles.less'
		])	
	.pipe(less())
	// add when ready for dist // .pipe(cssnano())
	.pipe(gulp.dest('../dist'));
});