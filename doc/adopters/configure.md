---
---

# Configuration

## Configuration File in Paella Player

The core file for configure Paella Player is under the config folder and its called "config.json". 
In this file we have all the setups concerning plugins.. streams.. compositions.. skins.. 


```javascript
{
  "player":{
    "accessControlClass":"paella.AccessControl",
    "profileFrameStrategy": "paella.ProfileFrameStrategy",
    "videoQualityStrategy": "paella.LimitedBestFitVideoQualityStrategy",
    "videoQualityStrategyParams":{ "maxAutoQualityRes":720 },
    "reloadOnFullscreen": true,
    "videoZoom": {
      "enabled":true,
      "max":800
    },
    "methods":[
      { "factory":"Html5VideoFactory", "enabled":true },
      { "factory":"MpegDashVideoFactory", "enabled":true },
      {
        "factory":"HLSVideoFactory",
        "enabled":true,
        "config": {
        	"maxBufferLength": 30,
			"maxMaxBufferLength": 600,
			"maxBufferSize": 60000000,
			"maxBufferHole": 0.5,
			"lowBufferWatchdogPeriod": 0.5,
        	"highBufferWatchdogPeriod": 3
        },
        "iOSMaxStreams": 2,
        "androidMaxStreams": 2
      },
      { "factory":"ImageVideoFactory", "enabled":true },
      { "factory":"YoutubeVideoFactory", "enabled":true }
    ],
    "audioMethods":[
      { "factory":"MultiformatAudioFactory", "enabled":true }
    ],
    "defaultAudioTag": "",
    "slidesMarks":{
      "enabled":true,
      "color":"gray"
    }
  },
  "data":{
    "enabled":true,
    "dataDelegates":{
      "trimming":"CookieDataDelegate",
      "metadata":"VideoManifestMetadataDataDelegate",
      "cameraTrack":"TrackCameraDataDelegate"
    }
  },
  "folders": {
    "profiles": "config/profiles",
    "resources": "resources",
    "skins": "resources/style"
  },
  "plugins":{
    "enablePluginsByDefault": false,

    "list": {
      "es.upv.paella.playPauseButtonPlugin": {"enabled":true},
      "other.plugin_1": { "enabled": true, "minWindowSize": 400, "other":"plugin configuration" },
      "other.plugin_2": { "enabled": true },
      "other.plugin_3": { "enabled": false }
    }
  },
  "standalone" : {
    "repository": "../repository/"
  },
  "skin": {
    "available": [
      "dark",
      "dark_small",
      "light",
      "light_small"
    ]
  }
}



```

## How To ?

### How to set streaming method priority?

In "player" : { "methods" } We can set the priority of streaming method.


### How set the default composition?

Use "defaultProfile" for set the default video composition.


### How to set/modify data delegates?

Take a look to the [DataDelegate](../developers/paella_data.md) page.

### How to use multiple audio tracks

See the documentation about the [support of multiple audios in Paella Player 6.4](hls_multiaudio.md)

### Can I choose when a plugin is shown depending on the play mode ( embed, fullScreen, standard .. etc )?

Inside config file at plugins section you can set the mode for show the plugin using:

```javascript
"es.upv.paella.xxx":{"enabled":true,......,"visibleOn":['standard', 'fullscreen', 'embed']},
```

Remember that this only works with ButtonPlugins.
