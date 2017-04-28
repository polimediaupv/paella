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
		path = require('path'),

		exec = require('child_process').execSync;

var config = {
	outDir:'build/'
};

function getVersion() {
	let pkg = require('./package.json');
	let rev = exec('git show --oneline -s');
	let re = /([a-z0-9:]+)\s/i;
	let reResult = re.exec(rev);
	if (reResult && !/fatal/.test(reResult[1])) {
		return pkg.version + ' - build: ' + reResult[1];
	}
	else {
		return pkg.version;
	}
}

gulp.task("webserver", function() {
	connect.server({
		name: 'Paella Player',
    	root: 'build',
    	port: 8000,
	});
});

gulp.task("compile", function() {
	return gulp.src(["src/*.js","plugins/*/*.js"])
		.pipe(traceur())
		.pipe(concat("paella_player.js"))
		.pipe(replace(/@version@/,getVersion()))
		.pipe(uglify())
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("compileDebug", function() {
	return gulp.src(["src/*.js","plugins/*/*.js"])
		.pipe(traceur())
		.pipe(concat("paella_player.js"))
		.pipe(replace(/\@version\@/,getVersion()))
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("styles", function() {
	let p = [];
	function genSkin(skinPath) {
		var stat = fs.statSync(skinPath);
		if (stat.isDirectory()) {
			
		}
		fs.readdirSync(skinPath)
			.forEach(function(pathItem) {
				if (pathItem.substr(pathItem.length - 5) == ".less") {
					let fullPath = path.join(skinPath,pathItem);
					p.push(gulp.src([fullPath,
							'resources/style/*.less',
							'resources/style/*.css',
							'plugins/**/*.less',
							'plugins/**/*.css',
							'vendor/plugins/**/*.less',
							'vendor/plugins/**/*.css'])
						.pipe(concat(`style_${pathItem}`))
						.pipe(less())
						.pipe(gulp.dest(`${config.outDir}player/resources/style`)));
				}
			});
	}
	genSkin('resources/style/skins');
	genSkin('vendor/skins');
	return Promise.all(p);
});

gulp.task("copy", function() {
	let p = [
		gulp.src('config/**')
			.pipe(gulp.dest(`${config.outDir}player/config`)),

		gulp.src('repository_test/**')
			.pipe(gulp.dest(`${config.outDir}`)),

		gulp.src('javascript/*')
			.pipe(gulp.dest(`${config.outDir}player/javascript/`)),

		gulp.src('resources/bootstrap/**')
			.pipe(gulp.dest(`${config.outDir}player/resources/bootstrap`)),

		gulp.src('resources/images/**')
			.pipe(gulp.dest(`${config.outDir}player/resources/images`)),

		gulp.src(['index.html','test.html'])
			.pipe(gulp.dest(`${config.outDir}player/`))
	];

	function addPlugins(pluginPath) {
		fs.readdirSync(pluginPath).forEach((dir) => {
			var fullDir = path.join('plugins',dir);
			var resourcesDir = path.join(fullDir,'resources/**');
			var depsDir = path.join(fullDir,'deps/**');
			p.push(gulp.src(resourcesDir)
				.pipe(gulp.dest(`${config.outDir}player/resources/style`)));
			p.push(gulp.src(depsDir)
				.pipe(gulp.dest(`${config.outDir}player/resources/deps`)));
		});
	}

	addPlugins('plugins');
	addPlugins('vendor/plugins');

	return Promise.all(p);
});

gulp.task("dictionary", function() {
	let p = [];
	fs.readdirSync('localization')
		.forEach((dict) => {
			let re = RegExp(".*_([a-z]+)\.json");
			let result = re.exec(dict);
			if (result) {
				let lang = result[1];
				p.push(gulp.src([
					'localization/' + dict,
					`plugins/**/localization/${lang}.json`
					])
					.pipe(merge(`paella_${lang}.json`))
					.pipe(gulp.dest(`${config.outDir}player/localization`)));
			}
		});
	return Promise.all(p);
});

gulp.task("setupBower", function() {
	config.outDir = "../bower-paella/";
});


gulp.task("build", ["compile","styles","dictionary","copy"]);
gulp.task("buildDebug", ["compileDebug","styles","dictionary","copy"]);
gulp.task("buildBower", ["setupBower","build"]);

gulp.task("watch", function() {
	return gulp.watch([
		'index.html',
		'config/**',
		'plugins/**',
		'vendor/plugins/**',
		'src/*.js'
	],["build"]);
});

gulp.task("watchDebug", function() {
	return gulp.watch([
		'index.html',
		'resources/**',
		'repository_test/**',
		'config/**',
		'plugins/**',
		'vendor/plugins/**',
		'src/*.js'
	],["buildDebug"]);
});

gulp.task("tools", function() {
	let p = [
		gulp.src('tools/**')
			.pipe(gulp.dest(`${config.outDir}tools`)),

		gulp.src('src/flash_streaming/*.swf')
			.pipe(gulp.dest(`${config.outDir}tools/rtmp-test/`))
	];
	return Promise.all(p);
});

gulp.task("default",["build"]);
gulp.task("serve",["buildDebug","webserver","tools","watchDebug"]);

// Compatibility
gulp.task("server.release",["build","webserver","tools","watch"]);
gulp.task("server.debug",["buildDebug","webserver","tools","watchDebug"]);
gulp.task("build.debug",["buildDebug"]);
gulp.task("build.release",["build"]);

gulp.task("build.bower",["buildBower"]);
