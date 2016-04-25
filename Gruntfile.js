var fs = require('fs');

module.exports = function(grunt) {
	var initConfig = {
		pkg: grunt.file.readJSON('package.json'),


		if: {
	        revision: {
	            options: {
	                test: function(){ return fs.statSync(".git").isDirectory(); }
	            },
	            ifTrue: [ 'revision' ]
	        },
	        'dist.js': {
	            options: {
	                test: function(){ return fs.statSync(".git").isDirectory(); }
	            },
	            ifTrue: [ 'concat:git.dist.js' ],
	            ifFalse: [ 'concat:dist.js' ]
	        }
	    },

		clean: {
			build: ["build"],
			less: ["build/style.less"]
		},
		revision: {
			options: {
				property: 'meta.revision',
				ref: 'HEAD',
				short: true
			}
		},
		copy: {
			paella: {
				files: [
					{expand: true, src: ['config/**', 'javascript/**', 'resources/bootstrap/**', 'resources/images/**', 'index.html', 'extended.html', 'paella-standalone.js'], dest: 'build/player/'},
 					{expand: true, src: ['vendor/images/**'], dest: 'build/player/resources/'},
					{expand: true, cwd: 'repository_test/', src: '**', dest: 'build/'},
					{expand: true, src:'plugins/*/resources/**', dest: 'build/player/resources/style/',
						rename: function (dest, src) { return dest+src.split('/').splice(3).join('/'); }
					},
					{expand: true, src:'plugins/*/deps/**', dest: 'build/player/resources/deps/',
						rename: function (dest, src) { return dest+src.split('/').splice(3).join('/'); }
					},
					{expand: true, src:'vendor/plugins/*/resources/**', dest: 'build/player/resources/style/',
						rename: function (dest, src) { return dest+src.split('/').splice(4).join('/'); }
					},
					{expand: true, src:'vendor/plugins/*/deps/**', dest: 'build/player/resources/deps/',
						rename: function (dest, src) { return dest+src.split('/').splice(4).join('/'); }
					},
					{src:['build/config_temp.json'],dest: 'build/player/config/config.json'},
					{expand: true, src:'plugins/*/lib/**', dest: 'build/player/javascript/' ,
						rename: function (dest, src) { return dest+src.split('/').splice(3).join('/'); }
					},
					{expand: true, src:'vendor/plugins/*/lib/**', dest: 'build/player/javascript/',
						rename: function (dest, src) { return dest+src.split('/').splice(4).join('/'); }
					}
				]
			}
		},
		concat: {
			options: {
				separator: '\n',
				process: function(src, filepath) {
					return '/*** File: ' + filepath + ' ***/\n' + src;
				}
			},
			'git.dist.js': {
				options: {
					footer: 'paella.version = "<%= pkg.version %> - build: <%= meta.revision %>";\n'
				},
				src: [
					'src/*.js',
					'plugins/*/*.js',
					'vendor/plugins/*/*.js'
				],
				dest: 'build/player/javascript/paella_player.js'
			},
			'dist.js': {
				options: {
					footer: 'paella.version = "<%= pkg.version %>";\n'
				},
				src: [
					'src/*.js',
					'plugins/*/*.js',
					'vendor/plugins/*/*.js'
				],
				dest: 'build/player/javascript/paella_player.js'
			}
		},
		uglify: {
			options: {
				banner: '/*\n' +
						'	Paella HTML5 Multistream Player v.<%= pkg.version %>\n' +
						'	Copyright (C) 2013  Universitat Politècnica de València' +
						'\n'+
						'	File generated at <%= grunt.template.today("dd-mm-yyyy") %>\n' +
						'*/\n',
				mangle: false
			},
			dist: {
				files: {
					'build/player/javascript/paella_player.js': ['build/player/javascript/paella_player.js']
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			dist: [
				// 'javascript/base.js',
				'src/*.js',
				'plugins/*/*.js',
				'vendor/plugins/*/*.js'
			]
		},
		csslint: {
			dist: {
				options: {
					"import": 2,
					"adjoining-classes": false,
					"box-model": false,
					"ids": false,
					"outline-none": false,
					"fallback-colors": false,
					"zero-units": false,
					"duplicate-background-images": false,
					"empty-rules": false,
					"shorthand": false,
					"overqualified-elements": false
				},
				src: ['plugins/*/*.css', 'resources/style/*.css']
			}
		},
		cssmin: {
			dist: {
				files: {
					'build/player/resources/plugins/plugins.css': ['build/player/resources/plugins/plugins.css']
				}
			}
		},
		'merge-json': {
			'i18n': {
				files: {
					'build/player/localization/paella_en.json': [ 'localization/*en.json', 'plugins/*/localization/*en.json', 'vendor/plugins/*/localization/*en.json' ],
					'build/player/localization/paella_es.json': [ 'localization/*es.json', 'plugins/*/localization/*es.json', 'vendor/plugins/*/localization/*es.json' ]
				}
			}
		},


		watch: {
			 release: {
				 files: [
				 	'index.html',
				 	'extended.html',
				 	'paella-standalone.js',
				 	'src/*.js',
				 	'plugins/**',
					'vendor/plugins/**',
					'resources/style/*.less',
					'src/flash_player/player.swf',
					 'src/flash_streaming/player_streaming.swf'
				 ],
				 tasks: ['build.release']
			},
			debug: {
				 files: [
				 	'index.html',
				 	'extended.html',
				 	'paella-standalone.js',
				 	'src/*.js',
				 	'plugins/**',
					'vendor/plugins/**',
					'resources/style/*.less',
					'src/flash_player/player.swf',
					 'src/flash_streaming/player_streaming.swf'
				 ],
				 tasks: ['build.debug']
			}
		},
		express: {
			paella: {
		      options: {
			      port:8000,
			      bases: 'build'
		      }
		  }
		},
		jsonlint: {
			paella: {
				src: [	'package.json',
						'config/*.json',
						'config/profiles/profiles.json',
						'repository_test/*/*.json',
						'plugins/*/localization/*.json',
						'vendor/plugins/*/localization/*.json',
						'localization/*.json'
				]
			}
		}
	};
	
	var paellaConfig = require(__dirname + '/config/config.json');
	if (!paellaConfig.skin) {
		paellaConfig.skin = { 'default':'dark' };
	}
	paellaConfig.skin.available = [];

	var skinsPath = __dirname + '/resources/style/skins/';
	var skins = fs.readdirSync(skinsPath);
	var externalSkinsPath = __dirname + '/vendor/skins/';
	var externalSkins = [];
	if (fs.existsSync(externalSkinsPath)) {
		externalSkins = fs.readdirSync(externalSkinsPath);
	}
	
	initConfig.concat.less = { 'files':{} };
	initConfig.less = {
		production: {
			options:{ paths: [ "css" ] },
			files:{}
		}
	};
	
	var paellaSkins = {}
	skins.forEach(function(file) {
		var extension = file.split('.').pop();
		if (extension=='less') {
			var skinName = file.replace(/\.[^/.]+$/, "");
			paellaSkins[skinName] = skinsPath + file;
		}
	});
	externalSkins.forEach(function(file) {
		var extension = file.split('.').pop();
		if (extension=='less') {
			var skinName = file.replace(/\.[^/.]+$/, "");
			paellaSkins[skinName] = externalSkinsPath + file;
		}
	});
	
	for (var skinName in paellaSkins) {
		var file = paellaSkins[skinName];
		var concatRule = [
			'plugins/*/*.less',
			'vendor/plugins/*/*.less',
			'resources/style/*.less',
			file
		]
		var stylePath = 'build/style_' + skinName + '.less';
		initConfig.concat.less.files[stylePath] = concatRule;
		initConfig.less.production.files['build/player/resources/style/style_' + skinName + '.css'] = stylePath;
		paellaConfig.skin.available.push(skinName);
	};

	if (!fs.existsSync(__dirname + '/build')) {
		fs.mkdirSync(__dirname + '/build');
	}
	fs.writeFileSync(__dirname + '/build/config_temp.json',JSON.stringify(paellaConfig,null,4));
	
	grunt.initConfig(initConfig);

	grunt.loadNpmTasks('grunt-git-revision');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-jsonlint');
	grunt.loadNpmTasks('grunt-merge-json');
	grunt.loadNpmTasks('grunt-if');



	grunt.registerTask('default', ['dist']);
	grunt.registerTask('checksyntax', ['concat:less','less:production','jshint', 'csslint', 'jsonlint']);

	grunt.registerTask('build.common', ['if:revision', 'checksyntax', 'copy:paella', 'if:dist.js', 'clean:less', 'merge-json:i18n']);
	grunt.registerTask('build.release', ['build.common', 'uglify:dist', 'cssmin:dist']);
	grunt.registerTask('build.debug', ['build.common']);

	grunt.registerTask('server.release', ['build.release', 'express', 'watch:release']);
	grunt.registerTask('server.debug', ['build.debug', 'express', 'watch:debug']);
	
};
