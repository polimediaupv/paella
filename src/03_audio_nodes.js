
(function() {
    class AudioElementBase extends paella.DomNode {
        constructor(id,stream) {
            super(id,'div');
            this._stream = stream;
        }

        load() {return Promise.reject(new Error("no such compatible video player")); }
        play() { return Promise.reject(new Error("no such compatible video player")); }
        pause() { return Promise.reject(new Error("no such compatible video player")); }
        isPaused() { return Promise.reject(new Error("no such compatible video player")); }
        duration() { return Promise.reject(new Error("no such compatible video player")); }
        setCurrentTime(time) { return Promise.reject(new Error("no such compatible video player")); }
        currentTime() { return Promise.reject(new Error("no such compatible video player")); }
        setVolume(volume) { return Promise.reject(new Error("no such compatible video player")); }
        volume() { return Promise.reject(new Error("no such compatible video player")); }
        setPlaybackRate(rate) { return Promise.reject(new Error("no such compatible video player")); }
        playbackRate() { return Promise.reject(new Error("no such compatible video player")); }
        unload() { return Promise.reject(new Error("no such compatible video player")); }
    };

    paella.AudioElementBase = AudioElementBase;
    paella.audioFactories = {};

    class AudioFactory {
        isStreamCompatible(streamData) {
            return false;
        }

        getAudioObject(id,streamData) {
            return null;
        }
    }

    paella.AudioFactory = AudioFactory;

    paella.audioFactory = {
        _factoryList:[],

        initFactories:function() {
            if (paella.audioFactories) {
                var This = this;
                paella.player.config.player.audioMethods.forEach(function(method) {
                    if (method.enabled) {
                        This.registerFactory(new paella.audioFactories[method.factory]());
                    }
                });
            }
        },

        getAudioObject:function(id, streamData) {
            if (this._factoryList.length==0) {
                this.initFactories();
            }
            var selectedFactory = null;
            if (this._factoryList.some(function(factory) {
                if (factory.isStreamCompatible(streamData)) {
                    selectedFactory = factory;
                    return true;
                }
            })) {
                return selectedFactory.getAudioObject(id, streamData);
            }
            return null;
        },

        registerFactory:function(factory) {
            this._factoryList.push(factory);
        }
    };

})();

