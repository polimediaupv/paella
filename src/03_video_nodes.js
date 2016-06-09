/*
 Paella HTML 5 Multistream Player
 Copyright (C) 2013  Universitat Politècnica de València

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


paella.Profiles = {
	profileList: null,
	
	getDefaultProfile: function() {
		if (paella.player && paella.player.config && paella.player.config.defaultProfile) {
				return paella.player.config.defaultProfile;
		}
		return undefined;		
	},
	
	loadProfile:function(profileName,onSuccessFunction) {
	
		var defaultProfile  = this.getDefaultProfile();		
		this.loadProfileList(function(data){		
			var profileData;
			if(data[profileName] ){
			    // Successful mapping
			    profileData = data[profileName];
			} else if (data[defaultProfile]) {
			    // Fallback to default profile
			    profileData = data[defaultProfile];
			    base.cookies.set("lastProfile", defaultProfile);
			} else {
			    // Unable to find or map defaultProfile in profiles.json
			    base.log.debug("Error loading the default profile. Check your Paella Player configuration");
			    return false;
			}
			onSuccessFunction(profileData);
		});
	},

	loadProfileList:function(onSuccessFunction) {
		var thisClass = this;
		if (this.profileList == null) {
			var params = { url: paella.utils.folders.profiles() + "/profiles.json" };
	
			base.ajax.get(params,function(data,mimetype,code) {
					if (typeof(data)=="string") {
						data = JSON.parse(data);
					}
					thisClass.profileList = data;
					onSuccessFunction(thisClass.profileList);
				},
				function(data,mimetype,code) {
					base.log.debug("Error loading video profiles. Check your Paella Player configuration");
				}
			);
		}
		else {
			onSuccessFunction(thisClass.profileList);
		}
	}
};

Class ("paella.RelativeVideoSize", {
	w:1280,h:720,

	proportionalHeight:function(newWidth) {
		return Math.floor(this.h * newWidth / this.w);
	},

	proportionalWidth:function(newHeight) {
		return Math.floor(this.w * newHeight / this.h);
	},

	percentVSize:function(pxSize) {
		return pxSize * 100 / this.h;
	},

	percentWSize:function(pxSize) {
		return pxSize * 100 / this.w;
	},

	aspectRatio:function() {
		return this.w/this.h;
	}
});

Class ("paella.VideoRect", paella.DomNode, {
	_rect:null,

	initialize:function(id, domType, left, top, width, height) {
		var This = this;
		this._rect = { left:left, top:top, width:width, height:height };
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(top) + '%';
		var percentLeft = relativeSize.percentWSize(left) + '%';
		var percentWidth = relativeSize.percentWSize(width) + '%';
		var percentHeight = relativeSize.percentVSize(height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:GlobalParams.video.zIndex};
		this.parent(domType,id,style);
	},

	setRect:function(rect,animate) {
		this._rect = JSON.parse(JSON.stringify(rect));
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(rect.top) + '%';
		var percentLeft = relativeSize.percentWSize(rect.left) + '%';
		var percentWidth = relativeSize.percentWSize(rect.width) + '%';
		var percentHeight = relativeSize.percentVSize(rect.height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute'};
		if (animate) {
			this.disableClassName();
			var thisClass = this;

			$(this.domElement).animate(style,400,function(){
				thisClass.enableClassName();
				paella.events.trigger(paella.events.setComposition, { video:thisClass });
			});
			this.enableClassNameAfter(400);
		}
		else {
			$(this.domElement).css(style);
			paella.events.trigger(paella.events.setComposition, { video:this });
		}
	},

	getRect:function() {
		return this._rect;
	},

	disableClassName:function() {
		this.classNameBackup = this.domElement.className;
		this.domElement.className = "";
	},

	enableClassName:function() {
		this.domElement.className = this.classNameBackup;
	},

	enableClassNameAfter:function(millis) {
		setTimeout("$('#" + this.domElement.id + "')[0].className = '" + this.classNameBackup + "'",millis);
	},

	setVisible:function(visible,animate) {
		if (visible=="true" && animate) {
			$(this.domElement).show();
			$(this.domElement).animate({opacity:1.0},300);
		}
		else if (visible=="true" && !animate) {
			$(this.domElement).show();
		}
		else if (visible=="false" && animate) {
			$(this.domElement).animate({opacity:0.0},300);
		}
		else if (visible=="false" && !animate) {
			$(this.domElement).hide();
		}
	},

	setLayer:function(layer) {
		this.domElement.style.zIndex = layer;
	}
});

function paella_Deferred(action,timeout) {
	timeout = timeout || 50;
	var def = $.Deferred();
	setTimeout(function() { action(def); }, timeout);
	return def;
}

function paella_DeferredResolved(param) {
	return paella_Deferred(function(def) { def.resolve(param); });
}

function paella_DeferredRejected(param) {
	return paella_Deferred(function(def) { def.reject(param); });
}

function paella_DeferredNotImplemented () {
	return paella_DeferredRejected(new Error("not implemented"));
}



Class ("paella.VideoElementBase", paella.VideoRect,{
	_ready:false,
	_autoplay:false,
	_stream:null,
	_videoQualityStrategy:null,


	initialize:function(id,stream,containerType,left,top,width,height) {
		this._stream = stream;
		this.parent(id, containerType, left, top, width, height);
		Object.defineProperty(this,'ready',{
			get:function() { return this._ready; }
		});
		if (this._stream.preview) this.setPosterFrame(this._stream.preview);
	},

	// Initialization functions
	setVideoQualityStrategy:function(strategy) {
		this._videoQualityStrategy = strategy;
	},

	setPosterFrame:function(url) {
		base.log.debug("TODO: implement setPosterFrame() function");
	},

	setAutoplay:function(autoplay) {
		this._autoplay = autoplay;
	},

	setMetadata:function(data) {
		this._metadata = data;
	},

	load:function() {
		return paella_DeferredNotImplemented();
	},

	// Playback functions
	getVideoData:function() {
		return paella_DeferredNotImplemented();
	},
	
	play:function() {
		base.log.debug("TODO: implement play() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	pause:function() {
		base.log.debug("TODO: implement pause() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	isPaused:function() {
		base.log.debug("TODO: implement isPaused() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	duration:function() {
		base.log.debug("TODO: implement duration() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	setCurrentTime:function(time) {
		base.log.debug("TODO: implement setCurrentTime() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	currentTime:function() {
		base.log.debug("TODO: implement currentTime() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	setVolume:function(volume) {
		base.log.debug("TODO: implement setVolume() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	volume:function() {
		base.log.debug("TODO: implement volume() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	setPlaybackRate:function(rate) {
		base.log.debug("TODO: implement setPlaybackRate() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	playbackRate: function() {
		base.log.debug("TODO: implement playbackRate() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	getQualities:function() {
		return paella_DeferredNotImplemented();
	},

	setQuality:function(index) {
		return paella_DeferredNotImplemented();
	},

	getCurrentQuality:function() {
		return paella_DeferredNotImplemented();
	},
	
	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();	// { width:X, height:Y }
	},

	goFullScreen:function() {
		return paella_DeferredNotImplemented();
	},

	freeze:function(){
		return paella_DeferredNotImplemented();
	},

	unFreeze:function(){
		return paella_DeferredNotImplemented();
	},



	// Utility functions
	setClassName:function(className) {
		this.domElement.className = className;
	},

	_callReadyEvent:function() {
		paella.events.trigger(paella.events.singleVideoReady, { sender:this });
	},

	_callUnloadEvent:function() {
		paella.events.trigger(paella.events.singleVideoUnloaded, { sender:this });
	}
});

Class ("paella.EmptyVideo", paella.VideoElementBase,{
	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'div',left,top,width,height);
	},

	// Initialization functions
	setPosterFrame:function(url) {},
	setAutoplay:function(auto) {},
	load:function() {return paella_DeferredRejected(new Error("no such compatible video player")); },
	play:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	pause:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	isPaused:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	duration:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	setCurrentTime:function(time) { return paella_DeferredRejected(new Error("no such compatible video player")); },
	currentTime:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	setVolume:function(volume) { return paella_DeferredRejected(new Error("no such compatible video player")); },
	volume:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	setPlaybackRate:function(rate) { return paella_DeferredRejected(new Error("no such compatible video player")); },
	playbackRate: function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	unFreeze:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	freeze:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	unload:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	getDimensions:function() { return paella_DeferredRejected(new Error("no such compatible video player")); }
});

Class ("paella.videoFactories.EmptyVideoFactory", paella.VideoFactory, {
	isStreamCompatible:function(streamData) {
		return true;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.EmptyVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});

Class ("paella.Html5Video", paella.VideoElementBase,{
	_posterFrame:null,
	_currentQuality:null,
	_autoplay:false,
	_streamName:null,

	initialize:function(id,stream,left,top,width,height,streamName) {
		this.parent(id,stream,'video',left,top,width,height);
		this._streamName = streamName || 'mp4';
		var This = this;

		if (this._stream.sources[this._streamName]) {
			this._stream.sources[this._streamName].sort(function (a, b) {
				return a.res.h - b.res.h;
			});
		}

		Object.defineProperty(this, 'video', {
			get:function() { return This.domElement; }
		});

		this.video.preload = "auto";

		function onProgress(event) {
			if (!This._ready && This.video.readyState==4) {
				This._ready = true;
				if (This._initialCurrentTipe!==undefined) {
					This.video.currentTime = This._initialCurrentTime;
					delete This._initialCurrentTime;
				}
				This._callReadyEvent();
			}
		}

		function evtCallback(event) { onProgress.apply(This,event); }

		$(this.video).bind('progress', evtCallback);
		$(this.video).bind('loadstart',evtCallback);
		$(this.video).bind('loadedmetadata',evtCallback);
        $(this.video).bind('canplay',evtCallback);
		$(this.video).bind('oncanplay',evtCallback);
	},


	_deferredAction:function(action) {
		var This = this;
		var defer = new $.Deferred();
		if (This.ready) {
			defer.resolve(action());
		}
		else {
			var resolve = function() {
				This._ready = true;
				defer.resolve(action());
			};
			$(This.video).bind('canplay',resolve);
		}

		return defer;
	},

	_getQualityObject:function(index, s) {
		return {
			index: index,
			res: s.res,
			src: s.src,
			toString:function() { return this.res.w + "x" + this.res.h; },
			shortLabel:function() { return this.res.h + "p"; },
			compare:function(q2) { return this.res.w*this.res.h - q2.res.w*q2.res.h; }
		};
	},

	// Initialization functions
	getVideoData:function() {
		var defer = $.Deferred();
		var This = this;
		this._deferredAction(function() {
			var videoData = {
				duration: This.video.duration,
				currentTime: This.video.currentTime,
				volume: This.video.volume,
				paused: This.video.paused,
				ended: This.video.ended,
				res: {
					w: This.video.videoWidth,
					h: This.video.videoHeight
				}
			};
			defer.resolve(videoData);
		});
		return defer;
	},
	
	setPosterFrame:function(url) {
		this._posterFrame = url;
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;
		if (auto && this.video) {
			this.video.setAttribute("autoplay",auto);
		}
	},

	load:function() {
		var This = this;
		var sources = this._stream.sources[this._streamName];
		if (this._currentQuality===null && this._videoQualityStrategy) {
			this._currentQuality = this._videoQualityStrategy.getQualityIndex(sources);
		}

		var stream = this._currentQuality<sources.length ? sources[this._currentQuality]:null;
		if (stream) {
			var sourceElem = this.video.querySelector('source');
			if (!sourceElem) {
				sourceElem = document.createElement('source');
				this.video.appendChild(sourceElem);
			}
			if (this._posterFrame) {
				this.video.setAttribute("poster",this._posterFrame);
			}

			sourceElem.src = stream.src;
			sourceElem.type = stream.type;
			this.video.load();

            return this._deferredAction(function() {
                return stream;
            });
		}
		else {
			return paella_DeferredRejected(new Error("Could not load video: invalid quality stream index"));
		}
	},

	getQualities:function() {
		var This = this;
		var defer = $.Deferred();
		setTimeout(function() {
			var result = [];
			var sources = This._stream.sources[This._streamName];
			var index = -1;
			sources.forEach(function(s) {
				index++;
				result.push(This._getQualityObject(index,s));
			});
			defer.resolve(result);
		},10);
		return defer;
	},

	setQuality:function(index) {
		var defer = $.Deferred();
		var This = this;
		var paused = This.video.paused;
		var sources = this._stream.sources[this._streamName];
		this._currentQuality = index<sources.length ? index:0;
		var currentTime = this.video.currentTime;
		this.freeze()

			.then(function() {
				This._ready = false;
				return This.load();
			})

			.then(function() {
				if (!paused) {
					This.play();
				}
				$(This.video).on('seeked',function() {
					This.unFreeze();
					defer.resolve();
					$(This.video).off('seeked');
				});
				This.video.currentTime = currentTime;
			});
		return defer;
	},

	getCurrentQuality:function() {
		var defer = $.Deferred();
		defer.resolve(this._getQualityObject(this._currentQuality,this._stream.sources[this._streamName][this._currentQuality]));
		return defer;
	},

	play:function() {
		var This = this;
        return this._deferredAction(function() {
            This.video.play();
        });
	},

	pause:function() {
		var This = this;
        return this._deferredAction(function() {
            This.video.pause();
        });
	},

	isPaused:function() {
		var This = this;
        return this._deferredAction(function() {
            return This.video.paused;
        });
	},

	duration:function() {
		var This = this;
        return this._deferredAction(function() {
            return This.video.duration;
        });
	},

	setCurrentTime:function(time) {
		var This = this;
        return this._deferredAction(function() {
            This.video.currentTime = time;
        });
	},

	currentTime:function() {
		var This = this;
        return this._deferredAction(function() {
            return This.video.currentTime;
        });
	},

	setVolume:function(volume) {
		var This = this;
        return this._deferredAction(function() {
            This.video.volume = volume;
        });
	},

	volume:function() {
		var This = this;
        return this._deferredAction(function() {
            return This.video.volume;
        });
	},

	setPlaybackRate:function(rate) {
		var This = this;
        return this._deferredAction(function() {
            This.video.playbackRate = rate;
        });
	},

	playbackRate: function() {
		var This = this;
        return this._deferredAction(function() {
            return This.video.playbackRate;
        });
	},

	goFullScreen:function() {
		var This = this;
		return this._deferredAction(function() {
			var elem = This.video;
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			}
			else if (elem.msRequestFullscreen) {
				elem.msRequestFullscreen();
			}
			else if (elem.mozRequestFullScreen) {
				elem.mozRequestFullScreen();
			}
			else if (elem.webkitEnterFullscreen) {
				elem.webkitEnterFullscreen();
			}
		});
	},


	unFreeze:function(){
		var This = this;
		return this._deferredAction(function() {
			var c = document.getElementById(This.video.className + "canvas");
			$(c).remove();
		});
	},
	
	freeze:function(){
		var This = this;
		return this._deferredAction(function() {
			var canvas = document.createElement("canvas");
			canvas.id = This.video.className + "canvas";
			canvas.width = This.video.videoWidth;
			canvas.height = This.video.videoHeight;
			canvas.style.cssText = This.video.style.cssText;
			canvas.style.zIndex = 2;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(This.video, 0, 0, Math.ceil(canvas.width/16)*16, Math.ceil(canvas.height/16)*16);//Draw image
			This.video.parentElement.appendChild(canvas);
		});
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();
	}
});

Class ("paella.videoFactories.Html5VideoFactory", {
	isStreamCompatible:function(streamData) {
		try {
			if (paella.videoFactories.Html5VideoFactory.s_instances>0 && 
				base.userAgent.system.iOS)
			{
				return false;
			}
			
			for (var key in streamData.sources) {
				if (key=='mp4') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		++paella.videoFactories.Html5VideoFactory.s_instances;
		return new paella.Html5Video(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});
paella.videoFactories.Html5VideoFactory.s_instances = 0;


Class ("paella.ImageVideo", paella.VideoElementBase,{
	_posterFrame:null,
	_currentQuality:null,
	_currentTime:0,
	_duration: 0,
	_ended:false,
	_playTimer:null,
	_playbackRate:1,

	_frameArray:null,


	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'img',left,top,width,height);
		var This = this;

		this._stream.sources.image.sort(function(a,b) {
			return a.res.h - b.res.h;
		});

		Object.defineProperty(this, 'img', {
			get:function() { return This.domElement; }
		});

		Object.defineProperty(this, 'imgStream', {
			get:function() {
				return this._stream.sources.image[this._currentQuality];
			}
		});

		Object.defineProperty(this, '_paused', {
			get:function() {
				return this._playTimer==null;
			}
		});
	},

	_deferredAction:function(action) {
		var This = this;
		var defer = new $.Deferred();

		if (This.ready) {
			defer.resolve(action());
		}
		else {
			var resolve = function() {
				This._ready = true;
				defer.resolve(action());
			};
			$(This.video).bind('paella:imagevideoready', resolve);
		}

		return defer;
	},

	_getQualityObject:function(index, s) {
		return {
			index: index,
			res: s.res,
			src: s.src,
			toString:function() { return this.res.w + "x" + this.res.h; },
			shortLabel:function() { return this.res.h + "p"; },
			compare:function(q2) { return this.res.w*this.res.h - q2.res.w*q2.res.h; }
		};
	},

	_loadCurrentFrame:function() {
		var This = this;
		if (this._frameArray) {
			var frame = this._frameArray[0];
			this._frameArray.some(function(f) {
				if (This._currentTime<f.time) {
					return true;
				}
				else {
					frame = f.src;
				}
			});
			this.img.src = frame;
		}
	},

	// Initialization functions
	getVideoData:function() {
		var defer = $.Deferred();
		var This = this;
		this._deferredAction(function() {
			var videoData = {
				duration: This._duration,
				currentTime: This._currentTime,
				volume: 0,
				paused: This._paused,
				ended: This._ended,
				res: {
					w: This.imgStream.res.w,
					h: This.imgStream.res.h
				}
			};
			defer.resolve(videoData);
		});
		return defer;
	},

	setPosterFrame:function(url) {
		this._posterFrame = url;
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;
		if (auto && this.video) {
			this.video.setAttribute("autoplay",auto);
		}
	},

	load:function() {
		var This = this;
		var sources = this._stream.sources.image;
		if (this._currentQuality===null && this._videoQualityStrategy) {
			this._currentQuality = this._videoQualityStrategy.getQualityIndex(sources);
		}

		var stream = this._currentQuality<sources.length ? sources[this._currentQuality]:null;
		if (stream) {
			this._frameArray = [];
			for (var key in stream.frames) {
				var time = Math.floor(Number(key.replace("frame_","")));
				this._frameArray.push({ src:stream.frames[key], time:time });
			}
			this._frameArray.sort(function(a,b) {
				return a.time - b.time;
			});
			this._ready = true;
			this._currentTime = 0;
			this._duration = stream.duration;
			this._loadCurrentFrame();
			paella.events.trigger("paella:imagevideoready");
			return this._deferredAction(function() {
				return stream;
			});
		}
		else {
			return paella_DeferredRejected(new Error("Could not load video: invalid quality stream index"));
		}
	},

	getQualities:function() {
		var This = this;
		var defer = $.Deferred();
		setTimeout(function() {
			var result = [];
			var sources = This._stream.sources[This._streamName];
			var index = -1;
			sources.forEach(function(s) {
				index++;
				result.push(This._getQualityObject(index,s));
			});
			defer.resolve(result);
		},10);
		return defer;
	},

	setQuality:function(index) {
		var defer = $.Deferred();
		var This = this;
		var paused = this._paused;
		var sources = this._stream.sources.image;
		this._currentQuality = index<sources.length ? index:0;
		var currentTime = this._currentTime;
		This.load()
			.then(function() {
				This._loadCurrentFrame();
				defer.resolve();
			});
		return defer;
	},

	getCurrentQuality:function() {
		var defer = $.Deferred();
		defer.resolve(this._getQualityObject(this._currentQuality,this._stream.sources.image[this._currentQuality]));
		return defer;
	},

	play:function() {
		var This = this;
		return this._deferredAction(function() {
			This._playTimer = new base.Timer(function() {
				This._currentTime += 0.25 * This._playbackRate;
				This._loadCurrentFrame();
			}, 250);
			This._playTimer.repeat = true;
		});
	},

	pause:function() {
		var This = this;
		return this._deferredAction(function() {
			This._playTimer.repeat = false;
			This._playTimer = null;
		});
	},

	isPaused:function() {
		var This = this;
		return this._deferredAction(function() {
			return This._paused;
		});
	},

	duration:function() {
		var This = this;
		return this._deferredAction(function() {
			return This._duration;
		});
	},

	setCurrentTime:function(time) {
		var This = this;
		return this._deferredAction(function() {
			This._currentTime = time;
		});
	},

	currentTime:function() {
		var This = this;
		return this._deferredAction(function() {
			return This._currentTime;
		});
	},

	setVolume:function(volume) {
		return this._deferredAction(function() {
			// No audo sources in image video
		});
	},

	volume:function() {
		return this._deferredAction(function() {
			// No audo sources in image video
			return 0;
		});
	},

	setPlaybackRate:function(rate) {
		var This = this;
		return this._deferredAction(function() {
			This._playbackRate = rate;
		});
	},

	playbackRate: function() {
		var This = this;
		return this._deferredAction(function() {
			return This._playbackRate;
		});
	},

	goFullScreen:function() {
		var This = this;
		return this._deferredAction(function() {
			var elem = This.img;
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			}
			else if (elem.msRequestFullscreen) {
				elem.msRequestFullscreen();
			}
			else if (elem.mozRequestFullScreen) {
				elem.mozRequestFullScreen();
			}
			else if (elem.webkitEnterFullscreen) {
				elem.webkitEnterFullscreen();
			}
		});
	},


	unFreeze:function(){
		return this._deferredAction(function() {});
	},

	freeze:function(){
		return this._deferredAction(function() {});
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();
	}
});


Class ("paella.videoFactories.ImageVideoFactory", {
	isStreamCompatible:function(streamData) {
		try {
			for (var key in streamData.sources) {
				if (key=='image') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.ImageVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});
