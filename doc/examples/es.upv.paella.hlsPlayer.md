---
---

# es.upv.paella.hlsPlayer

To play new types of video that are currently not supported, you can implement a video format plugin. Video format plugins are created by extending the `paella.Video` class, or any of its subclasses, and implementing and registering a factory, which checks whether the new plugin can or cannot be used to play the video.

The video format plugins are not part of the standard life cycle of the plugins, as they are only loaded if necessary, depending on the capabilities of the browser and the characteristics of the video.

## Example: hls player

### Video class

The HLS format is integrated into browsers from a `<video>` tag, and is implemented using the browser [Media Source Extensions](https://www.w3.org/TR/media-source/), except in the case of Safari, which supports it natively. Based on this, the video class for the HLS player is implemented by extending the paella.Html5Video class, which provides Paella Player's standard video playback capabilities. The HLS video class uses the [hls.js library](https://github.com/video-dev/hls.js/) to implement the HLS playback capabilities on top of the existing HTML 5 video player.

#### Main API functions

Depending on the capabilities you want to support in your video plugin, you can implement or override the following functions:

- this._autoplay
- load()
- supportAutoplay(): return true if your player supports autoplay
- getVideoData(): Returns a promise with the video data structure, that must include at least the following data:

```json
duration: total video duration
currentTime: current playback time
volume: audio volume
paused: true if the video is paused
ended: true if the video has reached the end
res: {
    w: video width size in pixels
    h: video height size in pixels
}
```

- play(): Returns a promise that must be accepted when the video begins to play.

- pause(): Returns a promise that must to be accepted when the video is paused.

- isPaused(): Returns a promise that is accepted with a `true` value if the video is paused.

- duration(): Returns a promise that is accepted with the duration of the video.

- setCurrentTime(time): Returns a promise that is accepted when the video has been seeked to the instant of time specified by `time` parameter.

- currentTime(): Returns a promise that is accepted with the current time instant of the video.

- setVolume(volume): Returns a promise that is accepted when the video volume is set to the `volume` parameter.

- volume(): Returns a promise that is accepted with the current volume of the video.

- setPlaybackRate(rate): Returns a promise when the video playback rate is set to the `rate` parameter.

- playbackRate(): Returns a promise that is accepted with the current playback rate of the video.

- getQualities(): Returns a promise accepted with an array containint the list of available qualities in the video. Each element in the array must include at least the following data:
    * index: quality index, from 0 to number of quality objects - 1
    * res.w and res.h: quality width and height in pixels
    * src: the quality object url, if applicable
    * toString: a function that returns a quality object human readable identifier.
    * shortLabel: the same as toString, but is used as a label for the quality selector button, so it should probably be a shorter label than toString.
    * compare: a function that compares this quality object with the other specified in the q2 parameter. Is used to let the player know which is the higher quality element.

```javascript
        index: 0,
        res: {
            w: 1280,
            h: 720
        },
        src: 'http://myvideoserver.com/source_url.mp4',
        toString:function() { return this.w + "x" this.h; },
        shortLabel:function() { return this.h + "p"; },
        compare:function(q2) { return (this.res.w*this.res.h) - (q2.res.w*q2.res.h); }
```

Note: You can use the helper function `_getQualityObject()`, defined in `paella.HTML5Video`, if your video format plugin extends this class:

```javascript
_getQualityObject(qualityIndex, sourceData) {
  return {
    index: qualityIndex,
    res: sourceData.res,
    src: sourceData.src,
    toString: function() {
      return this.res.w==0 ? "auto" : this.res.w + "x" + this.res.h;
    },
    shortLabel: function() {
      return this.res.w==0 ? "auto" : this.res.h + "p";
    },
    compare: function(q2) {
      return this.res.w*this.res.h - q2.res.w*q2.res.h;
    }
  };
}
```

- setQuality(index): Sets the quality of the video to that specified by the `index` parameter. Returns a promise that is accepted when the video quality has been changed.

- getCurrentQuality(): Returns a promise that is accepted with the current quality index.

- getDimensions(): Returns a promise that is accepted with an object containing the current video quality. `{ width: [video width in pixels], height:[video height in pixels] }`

- goFullScreen(): Returns a promise that is accepted when the video is set to fullscreen mode. This function is only called if the browser does not support the fullscreen mode for the player, and the video only has one stream.

- disable(isMainAudioPlayer): This function is called when this video is hidden, for example, if the user changes the layout of the player. In this function, you can do some optimizations, for example, pause the video so that it does not continue consuming bandwidth. The `isMainAudioPlayer` parameter will be true if this video is the main audio player. If the video is the main audio player, you should not pause it.

- enable(isMainAudioPlayer): This function is called when this video is shown again after being hidden. Note that `enable()` and `disable()` functions must be executed synchronously.

```javascript
class HLSPlayer extends paella.Html5Video {
    get config() {
        let config = {
            autoStartLoad: true,
            startPosition : -1,
            capLevelToPlayerSize: true,
            debug: false,
            defaultAudioCodec: undefined,
            initialLiveManifestSize: 1,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60*1000*1000,
            maxBufferHole: 0.5,
            lowBufferWatchdogPeriod: 0.5,
            highBufferWatchdogPeriod: 3,
            nudgeOffset: 0.1,
            nudgeMaxRetry : 3,
            maxFragLookUpTolerance: 0.2,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            enableWorker: true,
            enableSoftwareAES: true,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 1,
            manifestLoadingRetryDelay: 500,
            manifestLoadingMaxRetryTimeout : 64000,
            startLevel: undefined,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            levelLoadingRetryDelay: 500,
            levelLoadingMaxRetryTimeout: 64000,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 500,
            fragLoadingMaxRetryTimeout: 64000,
            startFragPrefetch: false,
            appendErrorMaxRetry: 3,
            enableWebVTT: true,
            enableCEA708Captions: true,
            stretchShortVideoTrack: false,
            maxAudioFramesDrift : 1,
            forceKeyFrameOnDiscontinuity: true,
            abrEwmaFastLive: 5.0,
            abrEwmaSlowLive: 9.0,
            abrEwmaFastVoD: 4.0,
            abrEwmaSlowVoD: 15.0,
            abrEwmaDefaultEstimate: 500000,
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,
            minAutoBitrate: 0
        };

        let pluginConfig = {};
        paella.player.config.player.methods.some((methodConfig) => {
            if (methodConfig.factory=="HLSVideoFactory") {
                pluginConfig = methodConfig.config;
                return true;
            }
        });

        for (let key in config) {
            if (pluginConfig[key]!=undefined) {
                config[key] = pluginConfig[key];
            }
        }

        return config;
    }

    constructor(id,stream,left,top,width,height) {
        super(id,stream,left,top,width,height,'hls');
    }
    
    _loadDeps() {
        return new Promise((resolve,reject) => {
            if (!window.$paella_hls) {
                require(['resources/deps/hls.min.js'],function(hls) {
                    window.$paella_hls = hls;
                    resolve(window.$paella_hls);
                });
            }
            else {
                resolve(window.$paella_hls);
            }	
        });
    }

    load() {
        if (this._posterFrame) {
            this.video.setAttribute("poster",this._posterFrame);
        }
        
        if (paella.utils.userAgent.system.iOS)// ||
        //	paella.utils.userAgent.browser.Safari)
        {
            return super.load();
        }
        else {
            let This = this;
            return new Promise((resolve,reject) => {
                var source = this._stream.sources.hls;
                if (source && source.length>0) {
                    source = source[0];
                    this._loadDeps()
                        .then(function(Hls) {
                            if(Hls.isSupported()) {
                                let cfg = This.config;
                                This._hls = new Hls(cfg);
                                This._hls.loadSource(source.src);
                                This._hls.attachMedia(This.video);
                                This.autoQuality = true;

                                This._hls.on(Hls.Events.LEVEL_SWITCHED, function(ev, data) {
                                    This._qualities = This._qualities || [];
                                    This.qualityIndex = This.autoQuality ? This._qualities.length - 1 : data.level;
                                    paella.events.trigger(paella.events.qualityChanged,{});
                                    if (console && console.log) console.log(`HLS: quality level changed to ${ data.level }`);
                                });
                                
                                This._hls.on(Hls.Events.ERROR, function (event, data) {
                                    //deal with nonfatal media errors that might come from redirects after session expiration
                                    if (data.fatal) {
                                        switch(data.type) {
                                        case Hls.ErrorTypes.NETWORK_ERROR:
                                            paella.log.error("paella.HLSPlayer: Fatal network error encountered, try to recover");
                                            This._hls.startLoad();
                                            break;
                                        case Hls.ErrorTypes.MEDIA_ERROR:
                                            paella.log.error("paella.HLSPlayer: Fatal media error encountered, try to recover");
                                            This._hls.recoverMediaError();
                                            break;
                                        default:
                                            paella.log.error("paella.HLSPlayer: Fatal Error. Can not recover");
                                            This._hls.destroy();
                                            reject(new Error("invalid media"));
                                            break;
                                        }
                                    }
                                });
                                This._hls.on(Hls.Events.MANIFEST_PARSED,function() {
                                    This._deferredAction(function() {
                                        resolve();
                                    });
                                });
                            }
                        });
                }
                else {
                    reject(new Error("Invalid source"));
                }
            });
        }
    }

    getQualities() {
        if (paella.utils.userAgent.system.iOS)// ||
    //		paella.utils.userAgent.browser.Safari)
        {
            return new Promise((resolve,reject) => {
                resolve([
                    {
                        index: 0,
                        res: "",
                        src: "",
                        toString:function() { return "auto"; },
                        shortLabel:function() { return "auto"; },
                        compare:function(q2) { return 0; }
                    }
                ]);
            });
        }
        else {
            let This = this;
            return new Promise((resolve) => {
                if (!this._qualities || this._qualities.length==0) {
                    This._qualities = [];
                    This._hls.levels.forEach(function(q, index){
                        This._qualities.push(This._getQualityObject(index, {
                            index: index,
                            res: { w:q.width, h:q.height },
                            bitrate: q.bitrate
                        }));						
                    });					
                    This._qualities.push(
                        This._getQualityObject(This._qualities.length, {
                            index:This._qualities.length,
                            res: { w:0, h:0 },
                            bitrate: 0
                        }));
                }
                This.qualityIndex = This._qualities.length - 1;
                resolve(This._qualities);
            });
        }
    }
    
    printQualityes() {
        return new Promise((resolve,reject) => {
            this.getCurrentQuality()
                .then((cq)=>{
                    return this.getNextQuality();
                })
                .then((nq) => {
                    resolve();
                })
        });		
    }
    
    setQuality(index) {
        if (paella.utils.userAgent.system.iOS)// ||
            //paella.utils.userAgent.browser.Safari)
        {
            return Promise.resolve();
        }
        else if (index!==null) {
            try {
                this.qualityIndex = index;
                let level = index;
                this.autoQuality = false;
                if (index==this._qualities.length-1) {
                    level = -1;
                    this.autoQuality = true;
                }
                this._hls.currentLevel = level;
            }
            catch(err) {

            }
            return Promise.resolve();
        }
        else {
            return Promise.resolve();
        }
    }

    getNextQuality() {
        return new Promise((resolve,reject) => {
            let index = this.qualityIndex;
            resolve(this._qualities[index]);
        });
    }
    
    getCurrentQuality() {
        if (paella.utils.userAgent.system.iOS)// ||
            //paella.utils.userAgent.browser.Safari)
        {
            return Promise.resolve(0);
        }
        else {
            return new Promise((resolve,reject) => {
                resolve(this._qualities[this.qualityIndex]);
            });
        }
    }
}

paella.HLSPlayer = HLSPlayer;
```

### Video Factory

To determine if a video plugin is suitable for playing a stream, you have to implement a VideoFactory subclass and register it. To register the video factory, you only need to add the class to the `paella.videoFactories` object.

A video factory must implement two methods:

- isStreamCompatible(streamData): returns true or false if your video plugin can handle the specified `streamData`

- getVideoObject(id,streamData,rect): returns an instance of your video player plugin.


```javascript
class HLSVideoFactory extends paella.VideoFactory {
    isStreamCompatible(streamData) {
        if (paella.videoFactories.HLSVideoFactory.s_instances===undefined) {
            paella.videoFactories.HLSVideoFactory.s_instances = 0;
        }
        try {
            if (paella.videoFactories.HLSVideoFactory.s_instances>0 && 
                paella.utils.userAgent.system.iOS)
        //	In old iOS devices, playing more than one HLS stream may cause that the browser tab crash
        //		&& (paella.utils.userAgent.system.Version.major<=10 && paella.utils.userAgent.system.Version.minor<3))
            {
                return false;
            }
            
            for (var key in streamData.sources) {
                if (key=='hls') return true;
            }
        }
        catch (e) {}
        return false;	
    }

    getVideoObject(id, streamData, rect) {
        ++paella.videoFactories.HLSVideoFactory.s_instances;
        return new paella.HLSPlayer(id, streamData, rect.x, rect.y, rect.w, rect.h);
    }
}

paella.videoFactories.HLSVideoFactory = HLSVideoFactory;
```

### Configuration

The last step to use a new video format plugin is to register it in the configuration file. The factories are registered in the `player.methods` array. To register the factory, you only have to add a new object with the name of your factory class and the settings. If there are more than one suitable factorires, Paella Player will choose the first one in the `player.methods` array.

```javascript
    Extracted from config.json:

    "methods":[

      other video factories, with more priority than HLSVideoFactory

      ...
      {
        "factory":"HLSVideoFactory",
        "enabled":true,
        "config": {
          "*** You can add more hls.js settings here": "",
          "https://github.com/video-dev/hls.js/blob/master/docs/API.md": "",
          "maxBufferLength": 30,
				  "maxMaxBufferLength": 600,
				  "maxBufferSize": 60000000,
				  "maxBufferHole": 0.5,
				  "lowBufferWatchdogPeriod": 0.5,
          "highBufferWatchdogPeriod": 3
        }
      },
      ...

      other video factories with less priority than HLSVideoFactory
    ],
```
