module.exports = function(grunt) { 
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		
		copy: {
			dist: {
				files: [
					{expand: true, src: ['config/**', 'javascript/**', 'resources/**', 'index.html', 'extended.html', 'paella-standalone.js', 'player.swf'], dest: 'dist/player/'},			
					{expand: true, cwd: 'repository_test/', src: '**', dest: 'dist/'},			
					{expand: true, src: 'plugins/*/resources/*', dest: 'dist/player/resources/plugins/', flatten:true }
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
				dest: 'dist/player/javascript/paella_player.js'
			},
			'dist.css': {
				src: [
					'plugins/**/*.css'
				],
				dest: 'dist/player/resources/plugins/plugins.css'
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
					'dist/player/javascript/paella_player.min.js': ['dist/player/javascript/paella_player.js']
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
			 dist: {
				 files: [
				 	'index.html',
				 	'extended.html',
				 	'src/*.js',
				 	'plugins/*/*.js',
				 	'plugins/*/*.css'
				 ],
				 tasks: ['dist']
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					hostname: '*',
					base: 'dist'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	
	
	grunt.registerTask('default', ['dist']);
	grunt.registerTask('checksyntax', ['jshint']);
	
	grunt.registerTask('dist', ['copy:dist', 'concat:dist.js', 'concat:dist.css', 'uglify:dist']);	
	grunt.registerTask('server', ['connect', 'watch:dist']);
		
};