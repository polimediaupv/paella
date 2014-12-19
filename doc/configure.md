#Configuration File in Paella Player

The core file for configure Paella Player is under the /config directory and its called "config.json". 
In this file we have all the setups concerning plugins.. streams.. compositions.. skins.. 


```javascript
{
	"player":{
        "profileFrameStrategy":"paella.ProfileFrameStrategy",
		"methods":[{"name":"streaming","enabled":true},
				   {"name":"html","enabled":true},
				   {"name":"flash","enabled":true},
                   {"name":"image","enabled":true}],
		"stream0Audio":true,
		"stream1Audio":false,
        "rtmpSettings":{
            "bufferTime":5
        }
	},
	"editor":{
			"enabled":true
	},
	"defaultProfile":"slide_professor",
	"data":{
		"enabled":true,
		"dataDelegates":{
			"default":"CookieDataDelegate",
			"trimming":"CookieDataDelegate",
			"userInfo": "UserDataDelegate",
			"images":"ImageZoomDataDelegate"
		}
	},
	"plugins":{
		"defaultConfig":{"enabled":true},
		"list":{
			"es.upv.paella.ImageControlPlugin":{"enabled":false},
			"es.upv.paella.ShowEditorPlugin":{"enabled":true,"alwaysVisible":true},
			"es.upv.paella.TrimmingPlayerPlugin":{"enabled":true},
			"es.upv.paella.editor.TrimmingTrackPlugin":{"enabled":true},
			"es.upv.paella.playPauseButtonPlugin":{"enabled":true},
            "es.upv.paella.test.videoLoadPlugin":{"enabled":false},
			"es.upv.paella.test.playbackRate":{"enabled":false},
			"es.upv.paella.volumeRangePlugin":{"enabled":true, "showMasterVolume": true, "showSlaveVolume": false },
			"es.upv.paella.userTrackingCollectorPlugIn": {"enabled": true, "heartBeatTime": 5000},
			"es.upv.paella.repeatButtonPlugin": {"enabled":false},
			"edu.harvard.dce.paella.flexSkipPlugin": {"enabled":true, "direction": "Rewind", "seconds": 10},
			"edu.harvard.dce.paella.flexSkipPluginForward": {"enabled":true, "direction": "Forward", "seconds": 30},
			"es.upv.paella.footprintsPlugin": {"enabled":false},
			"es.upv.paella.playbackRate": {"enabled":false},
            "es.upv.paella.helpPlugin": {"enabled":true, "langs":["en","es"]},
            "es.upv.paella.ZoomPlugin": {"enabled": true, "maxZoom":500, "minZoom":100, "zoomIncr":10},
            "es.upv.paella.fullScreenButtonPlugin": {"enabled":true, "reloadOnFullscreen":{ "enabled":true, "keepUserSelection":true }},
            "es.upv.paella.extendedProfilesPlugin": {"enabled":true, "reloadOnFullscreen":"reload" },
            "es.upv.paella.themeChooserPlugin":  {"enabled":true}
		}
	},
}
```

#- How To ?

##- How to set streaming method priority?

In "player" : { "methods" } We can set the priority of streaming method.

##- How to mute sound channels?

Use "player" : { "stream0Audio" , "stream1Audio" } for set the volume of sources.

##- How to enable or disable editor mode?

Use "editor" : { "enabled" }

##- How set the default composition?

Use "defaultProfile" for set the default video composition.

##- How to set/modify data delegates?

Take a look to the [Integrate Paella section](integrate.md)

##- Can I choose when a plugin is shown depending on the play mode ( embed, fullScreen, standard .. etc )?

Inside config file at plugins section you can set the mode for show the plugin using:
```javascript
"es.upv.paella.xxx":{"enabled":true,......,"visibleOn":['standard', 'fullscreen', 'extended', 'embed']},
```
Remember that this only works, with ButtonPlugins.
	
