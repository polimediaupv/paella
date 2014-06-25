module.exports = function(grunt) { 
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
				
		copy: {
			paella: {
				files: [
					{expand: true, src: ['config/**', 'javascript/**', 'resources/**', 'index.html', 'extended.html', 'paella-standalone.js', 'player.swf'], dest: 'build/player/'},			
					{expand: true, cwd: 'repository_test/', src: '**', dest: 'build/'},			
					{expand: true, src: 'plugins/*/resources/*', dest: 'build/player/resources/plugins/', flatten:true }
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
			'dist.js': {
				src: [
					'src/*.js',
					'plugins/*/*.js'
				],
				dest: 'build/player/javascript/paella_player.js'
			},
			'plugins.css': {
				src: [
					'plugins/**/*.css'
				],
				dest: 'build/player/resources/plugins/plugins.css'
			}
		},
		uglify: {
			options: {
				banner: '/*\n' +
						'	Paella HTML 5 Multistream Player\n' +
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
				jshintrc: 'jshintrc'
			},
			dist: [
				// 'javascript/base.js',
				'src/*.js',
				'plugins/*/*.js'
			]
		},
		
		
		watch: {
			 release: {
				 files: [
				 	'index.html',
				 	'extended.html',
				 	'src/*.js',
				 	'plugins/*/*.js',
				 	'plugins/*/*.css'
				 ],
				 tasks: ['build.release']
			},
			debug: {
				 files: [
				 	'index.html',
				 	'extended.html',
				 	'src/*.js',
				 	'plugins/*/*.js',
				 	'plugins/*/*.css'
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
		}		
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-express');	
	
		
	grunt.registerTask('default', ['dist']);
	grunt.registerTask('checksyntax', ['jshint']);
	
	grunt.registerTask('build.release', ['copy:paella', 'concat:dist.js', 'concat:plugins.css', 'uglify:dist']);	
	grunt.registerTask('build.debug', ['copy:paella', 'concat:dist.js', 'concat:plugins.css']);
	
	grunt.registerTask('server.release', ['build.release', 'express', 'watch:release']);
	grunt.registerTask('server.debug', ['build.debug', 'express', 'watch:debug']);
};