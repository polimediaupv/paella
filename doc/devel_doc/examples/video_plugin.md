# Video extension plugins
## es.upv.paella.mpegDashPlayer

This plugin adds support for MPEG-Dash sources. To create a video extension plugin, you must to
implement two classes:

- The player class: extend a paella.VideoElementBase class or subclass.
- The factory class: Create a class insode paella.videoFactories with two functions:
    - isStreamCompatible(streamData): Returns true if the video player can playback the source specified in streamData
    - getVideoObject(id,streamData,rect): This is the factory method that will create the video player instance.

You can add third party dependencies to the "deps" folder, inside the plugin folder. In this case, the plugin
includes a reference to the MPEG-Dash reference player:

    es.upv.paella.mpegDashPlayer
        deps
            dash.all.js
        mpeg-dash-player.js


## Create the player class

The MpegDashVideo plugin extends paella.Html5Video because MPEG-Dash uses a standard HTML video element. The
class constructor receives the stream data as parameter

    Class ("paella.MpegDashVideo", paella.Html5Video,{
        _posterFrame:null,
        _player:null,

        initialize:function(id,stream,left,top,width,height) {
            this.parent(id,stream,left,top,width,height);
            var This = this;
        },


## Load dependencies using require.js

        _loadDeps:function() {
            var defer = $.Deferred();
            if (!window.$paella_mpd) {
                require(['resources/deps/dash.all.js'],function() {
                    window.$paella_mpd = true;
                    defer.resolve();
                });
            }
            else {
                defer.resolve(window.$paella_mpd);
            }
            return defer;
        },

## Load video

        load:function() {
            var This = this;
            var defer = $.Deferred();
            var source = this._stream.sources.mpd;
            if (source && source.length>0) {
                source = source[0];
                this._loadDeps()
                    .then(function() {
                        var context = new Dash.di.DashContext();
                        player = new MediaPlayer(context);
                        dashContext = context;
                        player.startup();
                        player.debug.setLogToBrowserConsole(false);
                        player.attachView(This.video);
                        player.setAutoPlay(false);
                        player.setAutoSwitchQuality(false);
                        This._player = player;

                        player.addEventListener(MediaPlayer.events.STREAM_INITIALIZED,function(a,b) {
                            bitrates = player.getBitrateInfoListFor("video");
                            This._deferredAction(function() {
                                defer.resolve();
                            });
                        });

                        player.attachSource(source.src);
                    });
            }
            else {
                defer.reject(new Error("Invalid source"));
            }

            return defer;
        },

## getQualities():

This function is used to get the available qualities.

        getQualities:function() {
            var This = this;
            var defer = $.Deferred();
            this._deferredAction(function() {
                if (!This._qualities) {
                    This._qualities = [];
                    This._player
                        .getBitrateInfoListFor("video")

                        .sort(function(a,b) {
                            return a.bitrate - b.bitrate;
                        })

                        .forEach(function(item,index) {
                            This._qualities.push(This._getQualityObject(item,index,bitrates));
                        });
                }
                defer.resolve(This._qualities);
            });
            return defer;
        },

## Get and set the current video quality

        setQuality:function(index) {
            var defer = $.Deferred();
            var This = this;

            var currentQuality = this._player.getQualityFor("video");
            if (index!=currentQuality) {
                this._player.removeEventListener(MediaPlayer.events.METRIC_CHANGED);
                this._player.addEventListener(MediaPlayer.events.METRIC_CHANGED,function(a,b) {
                    if(a.type=="metricchanged" && a.data.stream=="video") {
                        if (currentQuality!=This._player.getQualityFor("video")) {
                            currentQuality = This._player.getQualityFor("video");
                            defer.resolve();
                        }
                    }
                });
                This._player.setQualityFor("video",index);
            }
            else {
                defer.resolve();
            }

            return defer;
        },

        getCurrentQuality:function() {
            var defer = $.Deferred();
            var index = this._player.getQualityFor("video");
            defer.resolve(this._getQualityObject(this._qualities[index],index,this._player.getBitrateInfoListFor("video")));
            return defer;
        },


## Factory class

    Class ("paella.videoFactories.MpegDashVideoFactory", {
        isStreamCompatible:function(streamData) {
            try {
                for (var key in streamData.sources) {
                    if (key=='mpd') return true;
                }
            }
            catch (e) {}
            return false;
        },

        getVideoObject:function(id, streamData, rect) {
            return new paella.MpegDashVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
        }
    });

