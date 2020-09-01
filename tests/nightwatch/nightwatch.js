let nightwatch = {
	"src_folders" : ["tests/nightwatch/tests"],
	"output_folder" : "tests/nightwatch/reports",
	"custom_commands_path" : "",
	"custom_assertions_path" : "",
	"page_objects_path" : "",
	"globals_path" : "",

	"webdriver" : {
		"start_process": true,
		"server_path": "node_modules/.bin/chromedriver",
		"cli_args": [
			"--verbose"
		],
		"port": 9515
	},


	"test_settings" : {
		"default" : {
			"launch_url" : "http://localhost:8000",
			"selenium_host"  : "localhost",
			"selenium_port"  : 4444,
			"silent": true,
			"screenshots" : {
				"enabled" : false,
				"path" : ""
			},
			"desiredCapabilities": {
				"browserName": "chrome",
				"chromeOptions" : {
					"args" : ["disable-web-security", "ignore-certificate-errors", "headless"],
				}
			}
		}
	}
};

if (process.platform=="win32") {
	nightwatch.webdriver.server_path = "node_modules/chromedriver/lib/chromedriver/chromedriver.exe";
}

module.exports = nightwatch;