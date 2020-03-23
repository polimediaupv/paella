
(function() {
    class AudioElementBase extends paella.DomNode {
        constructor(id,stream) {
            super('div',id);
            this._stream = stream;
            this._ready = false;
        }

        get ready() { return this._ready; } 

        get currentTimeSync() { return null; }
        get volumeSync() { return null; }
        get pausedSync() { return null; }
        get durationSync() { return null; }

        get stream() { return this._stream; }
        setAutoplay() {return Promise.reject(new Error("no such compatible video player"));}
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

        getQualities() {
            return Promise.resolve([
                {
                    index: 0,
                    res: { w: 0, h: 1 },
                    src: "",
                    toString: function() { return ""; },
                    shortLabel: function() { return ""; },
                    compare: function() { return 0; }
                }
            ]);
        }

        getCurrentQuality() { return Promise.resolve(0); }
        defaultProfile() { return null; }
        
        supportAutoplay() { return false;}
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
                paella.player.config.player.audioMethods = paella.player.config.player.audioMethods || {

                };
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

(function() {

function checkReady(cb) {
    let This = this;
    return new Promise((resolve,reject) => {
        if (This._ready) {
            resolve(typeof(cb)=='function' ? cb():true);
        }
        else {
            function doCheck() {
                if (This.audio.readyState>=This.audio.HAVE_CURRENT_DATA) {
                    This._ready = true;
                    resolve(typeof(cb)=='function' ? cb():true);
                }
                else {
                    setTimeout(doCheck,50);
                }
            }
            doCheck();
        }
    });
}

class MultiformatAudioElement extends paella.AudioElementBase {
    constructor(id,stream) {
        super(id,stream);
        this._streamName = "audio";

        this._audio = document.createElement('audio');
        this.domElement.appendChild(this._audio);
    }

    get buffered() {
		return this.audio && this.audio.buffered;
    }
    
    get audio() { return this._audio; }

    get currentTimeSync() {
		return this.ready ? this.audio.currentTimeSync : null;
	}

	get volumeSync() {
		return this.ready ? this.audio.volumeSync : null;
	}

	get pausedSync() {
		return this.ready ? this.audio.pausedSync : null;
	}

	get durationSync() {
		return this.ready ? this.audio.durationSync : null;
	}

    setAutoplay(ap) {
        this.audio.autoplay = ap;
    }

    load() {
        var This = this;
		var sources = this._stream.sources[this._streamName];
		var stream = sources.length>0 ? sources[0]:null;
		this.audio.innerText = "";
		if (stream) {
			var sourceElem = this.audio.querySelector('source');
			if (!sourceElem) {
				sourceElem = document.createElement('source');
				this.audio.appendChild(sourceElem);
			}

			sourceElem.src = stream.src;
			if (stream.type) sourceElem.type = stream.type;
			this.audio.load();

            return checkReady.apply(this, [function() {
                return stream;
            }]);
		}
		else {
			return Promise.reject(new Error("Could not load video: invalid quality stream index"));
		}
    }

    play() {
        return checkReady.apply(this, [() => {
            this.audio.play();
        }]);
    }

    pause() {
        return checkReady.apply(this, [() => {
            this.audio.pause();
        }]);
    }

    isPaused() {
        return checkReady.apply(this,[() => {
            return this.audio.paused;
        }]);
    }

    duration() {
        return checkReady.apply(this,[() => {
            return this.audio.duration;
        }]);
    }

    setCurrentTime(time) {
        return checkReady.apply(this,[() => {
            this.audio.currentTime = time;
        }]);
    }

    currentTime() {
        return checkReady.apply(this,[() => {
            return this.audio.currentTime;
        }]);
    }

    setVolume(volume) {
        return checkReady.apply(this,[() => {
            return this.audio.volume = volume;
        }]);
    }

    volume() {
        return checkReady.apply(this,[() => {
            return this.audio.volume;
        }]);
    }

    setPlaybackRate(rate) { 
        return checkReady.apply(this,[() => {
            this.audio.playbackRate = rate;
        }]);
    }
    playbackRate() {
        return checkReady.apply(this,[() => {
            return this.audio.playbackRate;
        }]);
    }

    unload() { return Promise.resolve(); }
};

paella.MultiformatAudioElement = MultiformatAudioElement;

class MultiformatAudioFactory {
    isStreamCompatible(streamData) {
        return true;
    }

    getAudioObject(id,streamData) {
        return new paella.MultiformatAudioElement(id,streamData);
    }
}

paella.audioFactories.MultiformatAudioFactory = MultiformatAudioFactory;

})();
