"use strict"
const	gulp = require('gulp'),
		concat = require('gulp-concat'),
		connect = require('gulp-connect'),
		replace = require('gulp-replace'),
		less = require('gulp-less'),
		traceur = require('gulp-traceur'),
		merge = require('gulp-merge-json'),
		fs = require('fs'),
		uglify = require('gulp-uglify'),
		flatten = require('gulp-flatten'),
		path = require('path'); 

var config = {
	outDir:'build/'
};

gulp.task("webserver", function() {
	connect.server({
		name: 'Paella Player',
    	root: 'build',
    	port: 8000,
	});
});

gulp.task("compile", function() {
	gulp.src(["src/*.js","plugins/*/*.js"])
		.pipe(traceur())
		.pipe(concat("paella_player.js"))
		.pipe(uglify())
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("compileDebug", function() {
	gulp.src(["src/*.js","plugins/*/*.js"])
		.pipe(traceur())
		.pipe(concat("paella_player.js"))
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("styles", function() {
	function genSkin(skinPath) {
		var stat = fs.statSync(skinPath);
		if (stat.isDirectory()) {
			
		}
		fs.readdirSync(skinPath)
			.forEach(function(pathItem) {
				let fullPath = path.join(skinPath,pathItem);
				gulp.src([fullPath,
						'resources/style/*.less',
						'resources/style/*.css',
						'plugins/**/*.less',
						'plugins/**/*.css',
						'vendor/plugins/**/*.less',
						'vendor/plugins/**/*.css'])
					.pipe(concat(`style_${pathItem}`))
					.pipe(less())
					.pipe(gulp.dest(`${config.outDir}player/resources/style`));
			});
	}
	genSkin('resources/style/skins');
	genSkin('vendor/skins');
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

	function addPlugins(pluginPath) {
		fs.readdirSync(pluginPath).forEach((dir) => {
			var fullDir = path.join('plugins',dir);
			var resourcesDir = path.join(fullDir,'resources/**');
			var depsDir = path.join(fullDir,'deps/**');
			gulp.src(resourcesDir)
				.pipe(gulp.dest(`${config.outDir}player/resources/style`));
			gulp.src(depsDir)
				.pipe(gulp.dest(`${config.outDir}player/resources/deps`));
		});
	}

	addPlugins('plugins');
	addPlugins('vendor/plugins');
});

gulp.task("dictionary", function() {
	fs.readdirSync('localization')
		.forEach((dict) => {
			let re = RegExp(".*_([a-z]+)\.json");
			let result = re.exec(dict);
			if (result) {
				let lang = result[1];
				gulp.src('localization/' + dict)
					.pipe(concat(`paella_${lang}.json`))
					.pipe(gulp.dest(`${config.outDir}player/localization`)); 
			}
		});
});


gulp.task("build", ["compile","styles","dictionary","copy"]);
gulp.task("buildDebug", ["compileDebug","styles","dictionary","copy"]);

gulp.task("watch", function() {
	gulp.watch([
		'index.html',
		'resources/**',
		'repository_test/**',
		'config/**',
		'plugins/**',
		'vendor/plugins/**',
		'src/*.js'
	],["build"]);
});

gulp.task("watchDebug", function() {
	gulp.watch([
		'index.html',
		'resources/**',
		'repository_test/**',
		'config/**',
		'plugins/**',
		'vendor/plugins/**',
		'src/*.js'
	],["buildDebug"]);
});

gulp.task("default",["build"]);
gulp.task("serve",["buildDebug","webserver","watchDebug"]);

// Compatibility
gulp.task("server.release",["build","webserver","watch"]);
gulp.task("server.debug",["buildDebug","webserver","watchDebug"]);
gulp.task("build.debug",["buildDebug"]);
gulp.task("build.release",["build"]);
