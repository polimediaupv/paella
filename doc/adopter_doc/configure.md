# Configuration File in Paella Player

The core file for configure Paella Player is under the config folder and its called "config.json". 
In this file we have all the setups concerning plugins.. streams.. compositions.. skins.. 


```javascript
{
	"player":{
		"accessControlClass":"paella.AccessControl",
		"profileFrameStrategy": "paella.ProfileFrameStrategy",
		"videoQualityStrategy": "paella.BestFitVideoQualityStrategy",

		"methods":[
			{ "factory":"RTMPVideoFactory", "enabled":true },
			{ "factory":"Html5VideoFactory", "enabled":true },
			{ "factory":"MpegDashVideoFactory", "enabled":true },
			{ "factory":"ImageVideoFactory", "enabled":true }
		],
	        "audio": {
	            "master": 1.0,
	            "slave": 0.0
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
			"//****": "Button Plugins",
			"edu.harvard.dce.paella.flexSkipPlugin": {"enabled":true, "direction": "Rewind", "seconds": 10},
			"edu.harvard.dce.paella.flexSkipForwardPlugin": {"enabled":true, "direction": "Forward", "seconds": 30},
            "es.upv.paella.captionsPlugin": {"enabled":true, "searchOnCaptions":true},
			"es.upv.paella.footprintsPlugin": {"enabled":false},
			"es.upv.paella.frameControlPlugin":  {"enabled": true},
            "es.upv.paella.fullScreenButtonPlugin": {"enabled":true, "reloadOnFullscreen":{ "enabled":true, "keepUserSelection":true }},
            "es.upv.paella.helpPlugin": {"enabled":true, "langs":["en","es"]},
            "es.upv.paella.multipleQualitiesPlugin": {"showWidthRes":true},
			"es.upv.paella.playbackRatePlugin": {"enabled":true, "availableRates": [0.75, 1, 1.25, 1.5]},			
			"es.upv.paella.playPauseButtonPlugin": {"enabled":true},
            "es.upv.paella.searchPlugin": {"enabled":true, "sortType":"time", "colorSearch":false},
            "es.upv.paella.socialPlugin": {"enabled":true},
            "es.upv.paella.themeChooserPlugin":  {"enabled":true},
			"es.upv.paella.viewModePlugin": { "enabled": true },
			"es.upv.paella.volumeRangePlugin":{"enabled":true, "showMasterVolume": true, "showSlaveVolume": false },

			"//****": "Video Overlay Button Plugins",
			"es.upv.paella.liveStramingIndicator":  { "enabled": true },
			"es.upv.paella.showEditorPlugin":{"enabled":true,"alwaysVisible":true},
			
			"//****": "TabBar Plugins",
			"es.upv.paella.commentsPlugin": {"enabled": false},
			"es.upv.paella.test.tabBarExamplePlugin": {"enabled": false},
			
			"//****": "Event Driven Plugins",
			"es.upv.paella.annotationsPlayerPlugin": {"enabled":false},
			"es.upv.paella.blackBoardPlugin": {"enable": true},
			"es.upv.paella.breaksPlayerPlugin": {"enable": true},
			"es.upv.paella.overlayCaptionsPlugin": {"enable": true},
			"es.upv.paella.playButtonOnScreenPlugin": {"enabled":true},
			"es.upv.paella.test.videoLoadPlugin": {"enabled":false},
			"es.upv.paella.translecture.captionsPlugin": {"enabled":true},
			"es.upv.paella.trimmingPlayerPlugin": {"enabled":true},
									
			"//****": "Captions Parser Plugins",
			"es.upv.paella.captions.DFXPParserPlugin": {"enabled":true},
			
			"//****": "Search Service Plugins",
			"es.upv.paella.search.captionsSearchPlugin": {"enabled":true},
			
			"//****": "User Tracking Saver Plugins",
			"es.upv.paella.usertracking.elasticsearchSaverPlugin": { "enabled": false, "url": "http://my.elastic.server"},
			"es.upv.paella.usertracking.GoogleAnalyticsSaverPlugIn": { "enabled": false, "trackingID": "UA-XXXXXXXX-Y" },
			
			"//****": "Editor Plugins",
			"es.upv.paella.editor.snapShotsEditorPlugin": {"enabled":true},
			"es.upv.paella.editor.toolStatusPlugin": {"enabled":true},
			"es.upv.paella.editor.trackAnnotationsPlugin": {"enabled":true},
			"es.upv.paella.editor.trackBreaksPlugin": {"enabled":true},
			"es.upv.paella.editor.trimmingTrackPlugin": {"enabled":true}
        }
	},
    "standalone" : {
        "repository": "../repository/"
    }
}


```

#- How To ?

##- How to set streaming method priority?

In "player" : { "methods" } We can set the priority of streaming method.

##- How to mute sound channels?

Use "player" : "audio" : { "master": "1.0"," slave":"0.0" } for set the volume of sources. [ 1.0 Is the max Volume and 0.0 is muted. ]

##- How to enable or disable editor mode?

Use "editor" : { "enabled" }

##- How set the default composition?

Use "defaultProfile" for set the default video composition.

##- How to set/modify data delegates?

Take a look to the [Integrate Paella section](integrate.md)

##- Can I choose when a plugin is shown depending on the play mode ( embed, fullScreen, standard .. etc )?

Inside config file at plugins section you can set the mode for show the plugin using:
```javascript
"es.upv.paella.xxx":{"enabled":true,......,"visibleOn":['standard', 'fullscreen', 'embed']},
```
Remember that this only works, with ButtonPlugins.
	
