# Plugin Configuration

Paella plugins can be configured throught the [paella configuration file](../configure.md).

The core file for configure Paella Player is under the /config directory and its called "config.json". 
In this file we have all the setups concerning plugins, streams, compositions, skins... 

Look the code below related to the plugins, used for enable or disable plugins, or for set constant variables... etc.

```javascript
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
```
when we are inside a plugin we can acces this variables using:

```javascript
this.config.<variable>
```

###More about [Plugin Creation](plugin_creation.md) and [Plugin Types](plugin_types.md)
