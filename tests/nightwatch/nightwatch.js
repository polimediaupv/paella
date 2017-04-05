module.exports = {
	"src_folders" : ["tests/nightwatch/tests"],
	"output_folder" : "tests/nightwatch/reports",
	"custom_commands_path" : "",
	"custom_assertions_path" : "",
	"page_objects_path" : "",
	"globals_path" : "",
	
	
	"test_settings" : {
		"default" : {
			"launch_url" : "http://paella",
			"selenium_host"  : "localhost",
			"selenium_port"  : 4444,
			"silent": true,
			"screenshots" : {
				"enabled" : false,
				"path" : ""
			},
			"desiredCapabilities": {
				"browserName": "chrome",
				"marionette": false
			}
		}
	}
};