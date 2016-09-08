"use strict"
const	gulp = require('gulp'),
		concat = require('gulp-concat'),
		connect = require('gulp-connect'),
		replace = require('gulp-replace'),
		less = require('gulp-less'),
		merge = require('gulp-merge-json'),
		fs = require('fs'),
		path = require('path'); 

var config = {
	outDir:'build-gulp/'
};

gulp.task("webserver", function() {
	connect.server();
});

gulp.task("compile", function() {
	gulp.src(["src/*.js","plugins/*/*.js"])
		.pipe(concat("paella_player.js"))
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("styles", function() {
	let skinPath = 'resources/style/skins';
	fs.readdirSync(skinPath)
		.forEach(function(pathItem) {
			let fullPath = path.join(skinPath,pathItem);
			gulp.src([fullPath,
					'resources/style/*.less',
					'resources/style/*.css',
					'plugins/**/*.less',
					'plugins/**/*.css'])
				.pipe(concat(`style_${pathItem}`))
				.pipe(less())
				.pipe(gulp.dest(`${config.outDir}player/resources/style`));
		});
});

gulp.task("copy", function() {
	gulp.src('config/**')
		.pipe(gulp.dest(`${config.outDir}player/config`));

	gulp.src('repository_test/**')
		.pipe(gulp.dest(`${config.outDir}`));

	gulp.src('javascript/*')
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));

	gulp.src('resources/bootstrap/**')
		.pipe(gulp.dest(`${config.outDir}player/resources/bootstrap`));
	gulp.src('resources/images/**')
		.pipe(gulp.dest(`${config.outDir}player/resources/images`));

	gulp.src('index.html')
		.pipe(gulp.dest(`${config.outDir}player/`));
});

gulp.task("dictionary", function() {
	gulp.src('localization/*')
		.pipe(gulp.dest(`${config.outDir}player/localization`));
});


gulp.task("build", ["compile","styles","dictionary","copy"]);

gulp.task("watch", function() {
	gulp.watch([
		'index.html',
		'resources/**',
		'repository_test/**',
		'config/**',
		'plugins/**/*.css',
		'plugins/**/*.js',
		'plugins/**/*.html',
		'src/*.js'
	],["buildDebug"]);
});

gulp.task("default",["build"]);
gulp.task("serve",["build","webserver","watch"]);
