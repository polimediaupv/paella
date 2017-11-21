/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/


paella.Profiles = {
	profileList: null,
	
	getDefaultProfile: function() {
		if (paella.player.videoContainer.masterVideo() && paella.player.videoContainer.masterVideo().defaultProfile()) {
			return paella.player.videoContainer.masterVideo().defaultProfile();
		}
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
		let zoomSettings = paella.player.config.player.videoZoom || {};
		let zoomEnabled = (zoomSettings.enabled!==undefined ? zoomSettings.enabled : true) && this.allowZoom();

		this.parent(domType,id,zoomEnabled ? {width:this._zoom + '%',height:"100%",position:'absolute'} : { width:"100%" });

		let eventCapture = document.createElement('div');
		setTimeout(() => this.domElement.parentElement.appendChild(eventCapture), 10);

		eventCapture.style.position = "absolute";
		eventCapture.style.top = "0px";
		eventCapture.style.left = "0px";
		eventCapture.style.right = "0px";
		eventCapture.style.bottom = "0px";

		if (zoomEnabled) {
			this._zoomAvailable = true;
			function checkZoomAvailable() {
				let minWindowSize = (paella.player.config.player &&
									paella.player.config.player.videoZoom &&
									paella.player.config.player.videoZoom.minWindowSize) || 500;

				let available = $(window).width()>=minWindowSize;
				if (this._zoomAvailable!=available) {
					this._zoomAvailable = available;
					paella.events.trigger(paella.events.zoomAvailabilityChanged, { available:available });
				}
			}
			checkZoomAvailable.apply(this);

			$(window).resize(() => {
				checkZoomAvailable.apply(this);
			});

			this._zoom = 100;
			this._mouseCenter = { x:0, y:0 };
			this._mouseDown = { x:0, y:0 };
			this._zoomOffset = { x:0, y: 0 };
			this._maxZoom = zoomSettings.max || 400;
			$(this.domElement).css({
				width: "100%",
				height: "100%",
				left:"0%",
				top: "0%"
			});

			Object.defineProperty(this,'zoom', {
				get: function() { return this._zoom; }
			});

			Object.defineProperty(this,'zoomOffset',{
				get: function() { return this._zoomOffset; }
			});

			function mousePos(evt) {
				return {
					x:evt.originalEvent.offsetX,
					y:evt.originalEvent.offsetY
				};
			}

			function wheelDelta(evt) {
				let wheel = evt.originalEvent.deltaY * (paella.utils.userAgent.Firefox ? 2:1);
				let maxWheel = 6;
				return -Math.abs(wheel) < maxWheel ? wheel : maxWheel * Math.sign(wheel);
			}

			function touchesLength(p0,p1) {
				return Math.sqrt(
					(p1.x - p0.x) * (p1.x - p0.x) +
					(p1.y - p0.y) * (p1.y - p0.y)
				);
			}

			function centerPoint(p0,p1) {
				return {
					x:(p1.x - p0.x) / 2 + p0.x,
					y:(p1.y - p0.y) / 2 + p0.y
				}
			}

			function panImage(o) {
				let center = {
					x: this._mouseCenter.x - o.x * 1.1,
					y: this._mouseCenter.y - o.y * 1.1
				};
				let videoSize = {
					w: $(this.domElement).width(),
					h: $(this.domElement).height()
				};
				let maxOffset = this._zoom - 100;
				let offset = {
					x: (center.x * maxOffset / videoSize.w),
					y: (center.y * maxOffset / videoSize.h)
				};
				
				if (offset.x>maxOffset) {
					offset.x = maxOffset;
				}
				else if (offset.x<0) {
					offset.x = 0;
				}
				else {
					this._mouseCenter.x = center.x;
				}
				if (offset.y>maxOffset) {
					offset.y = maxOffset;
				}
				else if (offset.y<0) {
					offset.y = 0;
				}
				else {
					this._mouseCenter.y = center.y;
				}
				$(this.domElement).css({
					left:"-" + offset.x + "%",
					top: "-" + offset.y + "%"
				});

				this._zoomOffset = {
					x: offset.x,
					y: offset.y
				};
				paella.events.trigger(paella.events.videoZoomChanged,{ video:this });
			}

			let touches = [];
			$(eventCapture).on('touchstart', (evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				touches = [];
				let videoOffset = $(this.domElement).offset();
				for (let i=0; i<evt.originalEvent.targetTouches.length; ++i) {
					let touch = evt.originalEvent.targetTouches[i];
					touches.push({
						x: touch.screenX - videoOffset.left,
						y: touch.screenY - videoOffset.top
					});
				}
				if (touches.length>1) evt.preventDefault();
			});

			$(eventCapture).on('touchmove', (evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				let curTouches = [];
				let videoOffset = $(this.domElement).offset();
				for (let i=0; i<evt.originalEvent.targetTouches.length; ++i) {
					let touch = evt.originalEvent.targetTouches[i];
					curTouches.push({
						x: touch.screenX - videoOffset.left,
						y: touch.screenY - videoOffset.top
					});
				}
				if (curTouches.length>1 && touches.length>1) {
					let l0 = touchesLength(touches[0],touches[1]);
					let l1 = touchesLength(curTouches[0],curTouches[1]);
					let delta = l1 - l0;
					let center = centerPoint(touches[0],touches[1]);
					this._mouseCenter = center;
					
					this._zoom += delta;
					this._zoom = this._zoom < 100 ? 100 : this._zoom;			
					this._zoom = this._zoom > this._maxZoom ? this._maxZoom : this._zoom;
					let newVideoSize = {
						w: $(this.domElement).width(),
						h: $(this.domElement).height()
					};
					let mouse = this._mouseCenter;
					$(this.domElement).css({
						width:this._zoom + '%',
						height:this._zoom + '%'
					});
					
					let maxOffset = this._zoom - 100;
					let offset = {
						x: (mouse.x * maxOffset / newVideoSize.w),
						y: (mouse.y * maxOffset / newVideoSize.h)
					};
					
					offset.x = offset.x<maxOffset ? offset.x : maxOffset;
					offset.y = offset.y<maxOffset ? offset.y : maxOffset;
					
					$(this.domElement).css({
						left:"-" + offset.x + "%",
						top: "-" + offset.y + "%"
					});

					this._zoomOffset = {
						x: offset.x,
						y: offset.y
					};
					paella.events.trigger(paella.events.videoZoomChanged,{ video:this });
					touches = curTouches;
					evt.preventDefault();
				}
				else if (curTouches.length>0) {
					let desp = {
						x: curTouches[0].x - touches[0].x,
						y: curTouches[0].y - touches[0].y,
					}

					panImage.apply(this,[desp]);
					touches = curTouches;

					evt.preventDefault();
				}
			});

			$(eventCapture).on('touchend', (evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				if (touches.length>1) evt.preventDefault();
			});

			this.zoomIn = () => {
				if (this._zoom>=this._maxZoom || !this._zoomAvailable) return;
				if (!this._mouseCenter) {
					this._mouseCenter = {
						x: $(this.domElement).width() / 2,
						y: $(this.domElement).height() / 2	
					}
				}
				this._zoom += 25;
				this._zoom = this._zoom < 100 ? 100 : this._zoom;			
				this._zoom = this._zoom > this._maxZoom ? this._maxZoom : this._zoom;
				let newVideoSize = {
					w: $(this.domElement).width(),
					h: $(this.domElement).height()
				};
				let mouse = this._mouseCenter;
				$(this.domElement).css({
					width:this._zoom + '%',
					height:this._zoom + '%'
				});
				
				let maxOffset = this._zoom - 100;
				let offset = {
					x: (mouse.x * maxOffset / newVideoSize.w),
					y: (mouse.y * maxOffset / newVideoSize.h)
				};
				
				offset.x = offset.x<maxOffset ? offset.x : maxOffset;
				offset.y = offset.y<maxOffset ? offset.y : maxOffset;
				
				$(this.domElement).css({
					left:"-" + offset.x + "%",
					top: "-" + offset.y + "%"
				});

				this._zoomOffset = {
					x: offset.x,
					y: offset.y
				};
				paella.events.trigger(paella.events.videoZoomChanged,{ video:this });
			}

			this.zoomOut = () => {
				if (this._zoom<=100 || !this._zoomAvailable) return;
				if (!this._mouseCenter) {
					this._mouseCenter = {
						x: $(this.domElement).width() / 2,
						y: $(this.domElement).height() / 2	
					}
				}
				this._zoom -= 25;
				this._zoom = this._zoom < 100 ? 100 : this._zoom;			
				this._zoom = this._zoom > this._maxZoom ? this._maxZoom : this._zoom;
				let newVideoSize = {
					w: $(this.domElement).width(),
					h: $(this.domElement).height()
				};
				let mouse = this._mouseCenter;
				$(this.domElement).css({
					width:this._zoom + '%',
					height:this._zoom + '%'
				});
				
				let maxOffset = this._zoom - 100;
				let offset = {
					x: (mouse.x * maxOffset / newVideoSize.w),
					y: (mouse.y * maxOffset / newVideoSize.h)
				};
				
				offset.x = offset.x<maxOffset ? offset.x : maxOffset;
				offset.y = offset.y<maxOffset ? offset.y : maxOffset;
				
				$(this.domElement).css({
					left:"-" + offset.x + "%",
					top: "-" + offset.y + "%"
				});

				this._zoomOffset = {
					x: offset.x,
					y: offset.y
				};
				paella.events.trigger(paella.events.videoZoomChanged,{ video:this });
			}

			$(eventCapture).on('mousewheel wheel',(evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				let mouse = mousePos(evt);
				let wheel = wheelDelta(evt);
				if (this._zoom>=this._maxZoom && wheel>0) return;
				this._zoom += wheel;
				this._zoom = this._zoom < 100 ? 100 : this._zoom;			
				this._zoom = this._zoom > this._maxZoom ? this._maxZoom : this._zoom;
				let newVideoSize = {
					w: $(this.domElement).width(),
					h: $(this.domElement).height()
				};
				$(this.domElement).css({
					width:this._zoom + '%',
					height:this._zoom + '%'
				});
				
				let maxOffset = this._zoom - 100;
				let offset = {
					x: (mouse.x * maxOffset / newVideoSize.w),
					y: (mouse.y * maxOffset / newVideoSize.h)
				};
				
				offset.x = offset.x<maxOffset ? offset.x : maxOffset;
				offset.y = offset.y<maxOffset ? offset.y : maxOffset;
				
				$(this.domElement).css({
					left:"-" + offset.x + "%",
					top: "-" + offset.y + "%"
				});

				this._zoomOffset = {
					x: offset.x,
					y: offset.y
				};
				paella.events.trigger(paella.events.videoZoomChanged,{ video:this });

				this._mouseCenter = mouse;
			});

			$(eventCapture).on('mousedown',(evt) => {
				this._mouseDown = mousePos(evt);
				this.drag = true;
			});

			$(eventCapture).on('mousemove',(evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				//this.drag = evt.buttons>0;
				if (this.drag) {
					paella.player.videoContainer.disablePlayOnClick();

					let mouse = mousePos(evt);
					panImage.apply(this,[{
						x: mouse.x - this._mouseDown.x,
						y: mouse.y - this._mouseDown.y
					}]);
					this._mouseDown = mouse;
				}
			});

			$(eventCapture).on('mouseup',(evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				this.drag = false;
				setTimeout(() => paella.player.videoContainer.enablePlayOnClick(), 10);
			});

			$(eventCapture).on('mouseleave',(evt) => {
				this.drag = false;
			});
		}
	},

	allowZoom: function() {
		return true;
	},

	captureFrame: function() {
		return Promise.resolve(null);
	},

	supportsCaptureFrame: function() {
		return Promise.resolve(false);
	},

	// zoomAvailable will only return true if the zoom is enabled, the
	// video plugin supports zoom and the current video resolution is higher than
	// the current video size
	zoomAvailable: function() {
		return this.allowZoom() && this._zoomAvailable;
	}
});

function paella_DeferredResolved(param) {
	return new Promise((resolve) => {
		resolve(param);
	});
}

function paella_DeferredRejected(param) {
	return new Promise((resolve,reject) => {
		reject(param);
	});
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

		Object.defineProperty(this,'stream',{
			get: function() {
				return this._stream;
			}
		});
		
		if (this._stream.preview) this.setPosterFrame(this._stream.preview);
	},

	defaultProfile:function() {
		return null;
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

	supportAutoplay:function() {
		return true;
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
		this._playbackRate = 1;

		if (this._stream.sources[this._streamName]) {
			this._stream.sources[this._streamName].sort(function (a, b) {
				return a.res.h - b.res.h;
			});
		}

		Object.defineProperty(this, 'video', {
			get:function() { return This.domElement; }
		});

		this.video.preload = "auto";
		this.video.setAttribute("playsinline","");

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
		return new Promise((resolve,reject) => {
			if (this.ready) {
				resolve(action());
			}
			else {
				$(this.video).bind('canplay',() => {
					this._ready = true;
					resolve(action());
				});
			}
		});
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

	captureFrame: function() {
		return new Promise((resolve) => {
			resolve({
				source:this.video,
				width:this.video.videoWidth,
				height:this.video.videoHeight
			});
		});
	},

	supportsCaptureFrame: function() {
		return Promise.resolve(true);
	},

	// Initialization functions
	getVideoData:function() {
		var This = this;
		return new Promise((resolve,reject) => {
			this._deferredAction(() => {
				resolve({
					duration: This.video.duration,
					currentTime: This.video.currentTime,
					volume: This.video.volume,
					paused: This.video.paused,
					ended: This.video.ended,
					res: {
						w: This.video.videoWidth,
						h: This.video.videoHeight
					}
				});
			});
		});
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
		this.video.innerHTML = "";
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
			this.video.playbackRate = this._playbackRate;

            return this._deferredAction(function() {
                return stream;
            });
		}
		else {
			return paella_DeferredRejected(new Error("Could not load video: invalid quality stream index"));
		}
	},

	getQualities:function() {
		return new Promise((resolve,reject) => {
			setTimeout(() => {
				var result = [];
				var sources = this._stream.sources[this._streamName];
				var index = -1;
				sources.forEach((s) => {
					index++;
					result.push(this._getQualityObject(index,s));
				});
				resolve(result);
			},10);
		});
	},

	setQuality:function(index) {
		return new Promise((resolve) => {
			var paused = this.video.paused;
			var sources = this._stream.sources[this._streamName];
			this._currentQuality = index<sources.length ? index:0;
			var currentTime = this.video.currentTime;
			
			let This = this;
			let onSeek = function() {
				This.unFreeze().then(() => {
					resolve();
					This.video.removeEventListener('seeked',onSeek,false);
				});
			};
	
			this.freeze()
				.then(() => {
					return this.load();
				})

				.then(() => {
					if (!paused) {
						this.play();
					}
					this.video.addEventListener('seeked',onSeek);
					this.video.currentTime = currentTime;
				});
		});
	},

	getCurrentQuality:function() {
		return new Promise((resolve) => {	
			resolve(this._getQualityObject(this._currentQuality,this._stream.sources[this._streamName][this._currentQuality]));
		});
	},

	play:function() {
        return this._deferredAction(() => {
            this.video.play();
        });
	},

	pause:function() {
        return this._deferredAction(() => {
            this.video.pause();
        });
	},

	isPaused:function() {
        return this._deferredAction(() => {
            return this.video.paused;
        });
	},

	duration:function() {
        return this._deferredAction(() => {
            return this.video.duration;
        });
	},

	setCurrentTime:function(time) {
        return this._deferredAction(() => {
            this.video.currentTime = time;
        });
	},

	currentTime:function() {
        return this._deferredAction(() => {
            return this.video.currentTime;
        });
	},

	setVolume:function(volume) {
        return this._deferredAction(() => {
            this.video.volume = volume;
			if (volume==0) {
				this.video.setAttribute("muted","muted");
				this.video.muted = true;
			}
			else {
				this.video.removeAttribute("muted");
				this.video.muted = false;
			}
        });
	},

	volume:function() {
		return this._deferredAction(() => {
            return this.video.volume;
        });
	},

	setPlaybackRate:function(rate) {
		return this._deferredAction(() => {
			this._playbackRate = rate;
            this.video.playbackRate = rate;
        });
	},

	playbackRate: function() {
        return this._deferredAction(() => {
            return this.video.playbackRate;
        });
	},

	supportAutoplay:function() {
		let macOS10_13_safari = paella.utils.userAgent.system.MacOS &&
								paella.utils.userAgent.system.Version.minor>=13 &&
								paella.utils.userAgent.browser.Safari;
		let iOS = paella.utils.userAgent.system.iOS;
		// Autoplay does not work from Chrome version 64
		let chrome_v64 =	paella.utils.userAgent.browser.Chrome &&
							paella.utils.userAgent.browser.Version.major>=64;
		if (macOS10_13_safari || iOS || chrome_v64)
		{
			return false;
		}
		else {
			return true;
		}
	},

	goFullScreen:function() {
		return this._deferredAction(() => {
			var elem = this.video;
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
		return this._deferredAction(() => {
			var c = document.getElementById(this.video.id + "canvas");
			if (c) {
				$(c).remove();
			}
		});
	},
	
	freeze:function(){
		var This = this;
		return this._deferredAction(function() {
			var canvas = document.createElement("canvas");
			canvas.id = This.video.id + "canvas";
			canvas.className = "freezeFrame";
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
				base.userAgent.system.iOS &&
				(paella.utils.userAgent.system.Version.major<=10 && paella.utils.userAgent.system.Version.minor<3))
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
		return new Promise((resolve) => {
			if (this.ready) {
				resolve(action());
			}
			else {
				var resolve = () => {
					this._ready = true;
					resolve(action());
				};
				$(this.video).bind('paella:imagevideoready', resolve);
			}
		});
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

	allowZoom:function() {
		return false;
	},

	getVideoData:function() {
		let This = this;
		return new Promise((resolve) => {
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
				resolve(videoData);
			});
		});
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

	supportAutoplay:function() {
		return true;
	},

	getQualities:function() {
		return new Promise((resolve) => {
			setTimeout(() => {
				var result = [];
				var sources = this._stream.sources[this._streamName];
				var index = -1;
				sources.forEach((s) => {
					index++;
					result.push(this._getQualityObject(index,s));
				});
				resolve(result);
			},10);
		});
	},

	setQuality:function(index) {
		return new Promise((resolve) => {
			let paused = this._paused;
			let sources = this._stream.sources.image;
			this._currentQuality = index<sources.length ? index:0;
			var currentTime = this._currentTime;
			this.load()
				.then(function() {
					this._loadCurrentFrame();
					resolve();
				});
		});
	},

	getCurrentQuality:function() {
		return new Promise((resolve) => {
			resolve(this._getQualityObject(this._currentQuality,this._stream.sources.image[this._currentQuality]));
		});
	},

	play:function() {
		let This = this;
		return this._deferredAction(() => {
			This._playTimer = new base.Timer(function() {
				This._currentTime += 0.25 * This._playbackRate;
				This._loadCurrentFrame();
			}, 250);
			This._playTimer.repeat = true;
		});
	},

	pause:function() {
		let This = this;
		return this._deferredAction(() => {
			This._playTimer.repeat = false;
			This._playTimer = null;
		});
	},

	isPaused:function() {
		return this._deferredAction(() => {
			return this._paused;
		});
	},

	duration:function() {
		return this._deferredAction(() => {
			return this._duration;
		});
	},

	setCurrentTime:function(time) {
		return this._deferredAction(() => {
			this._currentTime = time;
			this._loadCurrentFrame();
		});
	},

	currentTime:function() {
		return this._deferredAction(() => {
			return this._currentTime;
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
		return this._deferredAction(() => {
			this._playbackRate = rate;
		});
	},

	playbackRate: function() {
		return this._deferredAction(() => {
			return this._playbackRate;
		});
	},

	goFullScreen:function() {
		return this._deferredAction(() => {
			var elem = this.img;
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
