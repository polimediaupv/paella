---
---

# Configuration File in Paella Player

The core file for configure Paella Player is under the config folder and its called "config.json". 
In this file we have all the setups concerning plugins.. streams.. compositions.. skins.. 


```javascript
{
	"player":{
		"accessControlClass":"paella.AccessControl",
		"profileFrameStrategy": "paella.ProfileFrameStrategy",
		"videoQualityStrategy": "paella.BestFitVideoQualityStrategy",
		"reloadOnFullscreen": false,

		"methods":[
			{ "factory":"ChromaVideoFactory", "enabled":true },
			{ "factory":"WebmVideoFactory", "enabled":true },
			{ "factory":"Html5VideoFactory", "enabled":true },
			{ "factory":"MpegDashVideoFactory", "enabled":true },
			{ "factory":"HLSVideoFactory", "enabled":true },
			{ "factory":"RTMPVideoFactory", "enabled":true },
			{ "factory":"ImageVideoFactory", "enabled":true },
			{ "factory":"YoutubeVideoFactory", "enabled":true }
		],
		"audioMethods":[
			{ "factory":"MultiformatAudioFactory", "enabled":true }
		],
	   	"audio": {
	   		"master": 1.0
	    },
	    "rtmpSettings":{
	    	"bufferTime":5,
	    	"requiresSubscription": false
       },
		"slidesMarks":{
			"enabled":true,
			"color":"gray"
		}
	},
	"defaultProfile":"slide_professor",
	"data":{
		"enabled":true,
		"dataDelegates":{
			"default":"CookieDataDelegate",
			"trimming":"CookieDataDelegate",
			"userInfo": "UserDataDelegate",
			"visualAnnotations": "VisualAnnotationsDataDelegate"
		}
	},
	"folders": {
		"profiles": "config/profiles",
		"resources": "resources",
		"skins": "resources/style"
	},
	"experimental":{
		"autoplay":true
	},
	"plugins":{
		"enablePluginsByDefault": false,		

		"//**** Instructions: Disable any individual plugin by setting its enable property to false": {"enabled": false},
		"//**** For a list of available plugins and configuration, go to": "https://github.com/polimediaupv/paella/blob/master/doc/plugins.md",
		"list":{
			"audioMethods":[
			{ "factory":"MultiformatAudioFactory", "enabled":true }
		],
        }
	},
    "standalone" : {
        "repository": "../repository/"
    }
}


```

# How To ?

## How to set streaming method priority?

In "player" : { "methods" } We can set the priority of streaming method.


## How set the default composition?

Use "defaultProfile" for set the default video composition.


## How to set/modify data delegates?

Take a look to the [Integrate Paella section](integrate.md)


## Can I choose when a plugin is shown depending on the play mode ( embed, fullScreen, standard .. etc )?

Inside config file at plugins section you can set the mode for show the plugin using:
```javascript
"es.upv.paella.xxx":{"enabled":true,......,"visibleOn":['standard', 'fullscreen', 'embed']},
```
Remember that this only works with ButtonPlugins.
	
