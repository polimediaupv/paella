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

(() => {

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
				paella.log.debug("Error loading the default profile. Check your Paella Player configuration");
				return false;
			}
			onSuccessFunction(profileData);
		});
	},

	loadProfileList:function(onSuccessFunction) {
		var thisClass = this;
		if (this.profileList == null) {
			var params = { url: paella.utils.folders.profiles() + "/profiles.json" };
	
			paella.utils.ajax.get(params,function(data,mimetype,code) {
					if (typeof(data)=="string") {
						data = JSON.parse(data);
					}
					thisClass.profileList = data;
					onSuccessFunction(thisClass.profileList);
				},
				function(data,mimetype,code) {
					paella.log.debug("Error loading video profiles. Check your Paella Player configuration");
				}
			);
		}
		else {
			onSuccessFunction(thisClass.profileList);
		}
	}
};

class RelativeVideoSize {
	get w() { return this._w || 1280; }
	set w(v) { this._w = v; }
	get h() { return this._h || 720; }
	set h(v) { this._h = v; }
	
	proportionalHeight(newWidth) {
		return Math.floor(this.h * newWidth / this.w);
	}

	proportionalWidth(newHeight) {
		return Math.floor(this.w * newHeight / this.h);
	}

	percentVSize(pxSize) {
		return pxSize * 100 / this.h;
	}

	percentWSize(pxSize) {
		return pxSize * 100 / this.w;
	}

	aspectRatio() {
		return this.w/this.h;
	}
}

paella.RelativeVideoSize = RelativeVideoSize;



class VideoRect extends paella.DomNode {
	
	constructor(id, domType, left, top, width, height) {
		super(domType,id,{});
		
		let zoomSettings = paella.player.config.player.videoZoom || {};
		let zoomEnabled = (zoomSettings.enabled!==undefined ? zoomSettings.enabled : true) && this.allowZoom();
		this.style = zoomEnabled ? {width:this._zoom + '%',height:"100%",position:'absolute'} : { width:"100%", height:"100%" };
		this._rect = null;

		let eventCapture = document.createElement('div');
		setTimeout(() => this.domElement.parentElement.appendChild(eventCapture), 10);

		eventCapture.id = id + "EventCapture";
		eventCapture.style.position = "absolute";
		eventCapture.style.top = "0px";
		eventCapture.style.left = "0px";
		eventCapture.style.right = "0px";
		eventCapture.style.bottom = "0px";
		this.eventCapture = eventCapture;

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
			this._maxZoom = zoomSettings.max || 400;
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
					x: (center.x * maxOffset / videoSize.w) * (maxOffset / 100),
					y: (center.y * maxOffset / videoSize.h) * (maxOffset / 100)
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
					x: (mouse.x * maxOffset / newVideoSize.w) * (maxOffset / 100),
					y: (mouse.y * maxOffset / newVideoSize.h) * (maxOffset / 100)
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
					x: (mouse.x * maxOffset / newVideoSize.w) * (maxOffset / 100),
					y: (mouse.y * maxOffset / newVideoSize.h) * (maxOffset / 100)
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

			let altScrollMessageContainer = document.createElement('div');
			altScrollMessageContainer.className = "alt-scroll-message-container";
			altScrollMessageContainer.innerHTML = "<p>" + paella.utils.dictionary.translate("Use Alt+Scroll to zoom the video") + "</p>";
			eventCapture.appendChild(altScrollMessageContainer);
			$(altScrollMessageContainer).css({ opacity: 0.0 });
			let altScrollMessageTimer = null;
			function clearAltScrollMessage(animate = true) {
				animate ? 
					$(altScrollMessageContainer).animate({ opacity: 0.0 }) :
					$(altScrollMessageContainer).css({ opacity: 0.0 });
			}
			function showAltScrollMessage() {
				if (altScrollMessageTimer) {
					clearTimeout(altScrollMessageTimer);
					altScrollMessageTimer = null;
				}
				else {
					$(altScrollMessageContainer).css({ opacity: 1.0 });
				}
				altScrollMessageTimer = setTimeout(() => {
					clearAltScrollMessage();
					altScrollMessageTimer = null;
				}, 500);
			}

			$(eventCapture).on('mousewheel wheel',(evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				if (!evt.altKey) {
					showAltScrollMessage();
					return;
				}
				else {
					clearAltScrollMessage(false);
					if (altScrollMessageTimer) {
						clearTimeout(altScrollMessageTimer);
						altScrollMessageTimer = null;
					}
				}
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
					x: (mouse.x * maxOffset / newVideoSize.w) * (maxOffset / 100),
					y: (mouse.y * maxOffset / newVideoSize.h) * (maxOffset / 100)
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
				evt.stopPropagation();
				return false;
			});

			$(eventCapture).on('mousedown',(evt) => {
				this._mouseDown = mousePos(evt);
				this.drag = true;
			});

			$(eventCapture).on('mousemove',(evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				let mouse = mousePos(evt);
				let offset = {
					x: mouse.x - this._mouseDown.x,
					y: mouse.y - this._mouseDown.y
				};

				// We have not found out why there are sometimes sudden jumps in the
				// position of the mouse cursos, so we avoid the problem
				if ((Math.abs(offset.x)>80 || Math.abs(this.y)>80) && this.drag) {
					this._mouseDown = mouse;
					return;
				}

				this.drag = evt.buttons>0;

				if (this.drag) {
					paella.player.videoContainer.disablePlayOnClick();
					panImage.apply(this,[offset]);
					this._mouseDown = mouse;
				}
			});

			$(eventCapture).on('mouseup',(evt) => {
				if (!this.allowZoom() || !this._zoomAvailable) return;
				this.drag = false;
				paella.player.videoContainer.enablePlayOnClick(1000);
			});

			$(eventCapture).on('mouseleave',(evt) => {
				this.drag = false;
			});
		}
	}

	get canvasData() {
		let canvasType = this._stream && Array.isArray(this._stream.canvas) && this._stream.canvas[0];
		let canvasData = canvasType && paella.getVideoCanvasData(this._stream.canvas[0]) || { mouseEventsSupport: false, webglSupport: false };
		return canvasData;
	}

	allowZoom() {
		return !this.canvasData.mouseEventsSupport;
	}

	setZoom(zoom,left,top,tween=0) {
		if (this.zoomAvailable()) {
			this._zoomOffset.x = left;
			this._zoomOffset.y = top;
			this._zoom = zoom;
			
			if (tween==0) {
				$(this.domElement).css({
					width:this._zoom + '%',
					height:this._zoom + '%',
					left:"-" + this._zoomOffset.x + "%",
					top: "-" + this._zoomOffset.y + "%"
				});
			}
			else {
				$(this.domElement).stop(true,false).animate({
					width:this._zoom + '%',
					height:this._zoom + '%',
					left:"-" + this._zoomOffset.x + "%",
					top: "-" + this._zoomOffset.y + "%"
				},tween,"linear");
			}

			paella.events.trigger(paella.events.videoZoomChanged,{ video:this });
		}
	}

	captureFrame() {
		return Promise.resolve(null);
	}

	supportsCaptureFrame() {
		return Promise.resolve(false);
	}

	// zoomAvailable will only return true if the zoom is enabled, the
	// video plugin supports zoom and the current video resolution is higher than
	// the current video size
	zoomAvailable() {
		return this.allowZoom() && this._zoomAvailable;
	}

	disableEventCapture() {
		this.eventCapture.style.pointerEvents = 'none';
	}

	enableEventCapture() {
		this.eventCapture.style.pointerEvents = '';
	}
}

paella.VideoRect = VideoRect;

class VideoElementBase extends paella.VideoRect {

	constructor(id,stream,containerType,left,top,width,height) {
		super(id, containerType, left, top, width, height);
		
		this._stream = stream;

		this._ready = false;
		this._autoplay = false;
		this._videoQualityStrategy = null;
		
		if (this._stream.preview) this.setPosterFrame(this._stream.preview);

		if (this.canvasData.mouseEventsSupport) {
			this.disableEventCapture();
		}
	}

	get ready() { return this._ready; }
	get stream() { return this._stream; }

	defaultProfile() {
		return null;
	}

	// Synchronous functions: returns null if the resource is not loaded. Use only if 
	// the resource is loaded.
	get currentTimeSync() { return null; }
	get volumeSync() { return null; }
	get pausedSync() { return null; }
	get durationSync() { return null; }

	// Initialization functions
	setVideoQualityStrategy(strategy) {
		this._videoQualityStrategy = strategy;
	}

	setPosterFrame(url) {
		paella.log.debug("TODO: implement setPosterFrame() function");
	}

	setAutoplay(autoplay) {
		this._autoplay = autoplay;
	}

	setMetadata(data) {
		this._metadata = data;
	}

	load() {
		return paella_DeferredNotImplemented();
	}

	supportAutoplay() {
		return true;
	}

	// Video canvas functions
	videoCanvas() {
		return Promise.reject(new Error("VideoElementBase::videoCanvas(): Not implemented in child class."));
	}

	// Multi audio functions
	supportsMultiaudio() {
		return Promise.resolve(false);
	}

	getAudioTracks() {
		return Promise.resolve([]);
	}

	setCurrentAudioTrack(trackId) {
		return Promise.resolve(false);
	}

	getCurrentAudioTrack() {
		return Promise.resolve(-1);
	}

	// Playback functions
	getVideoData() {
		return paella_DeferredNotImplemented();
	}
	
	play() {
		paella.log.debug("TODO: implement play() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	pause() {
		paella.log.debug("TODO: implement pause() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	isPaused() {
		paella.log.debug("TODO: implement isPaused() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	duration() {
		paella.log.debug("TODO: implement duration() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	setCurrentTime(time) {
		paella.log.debug("TODO: implement setCurrentTime() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	currentTime() {
		paella.log.debug("TODO: implement currentTime() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	setVolume(volume) {
		paella.log.debug("TODO: implement setVolume() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	volume() {
		paella.log.debug("TODO: implement volume() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	setPlaybackRate(rate) {
		paella.log.debug("TODO: implement setPlaybackRate() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	playbackRate() {
		paella.log.debug("TODO: implement playbackRate() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	}

	getQualities() {
		return paella_DeferredNotImplemented();
	}

	setQuality(index) {
		return paella_DeferredNotImplemented();
	}

	getCurrentQuality() {
		return paella_DeferredNotImplemented();
	}
	
	unload() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	}

	getDimensions() {
		return paella_DeferredNotImplemented();	// { width:X, height:Y }
	}

	goFullScreen() {
		return paella_DeferredNotImplemented();
	}

	freeze(){
		return paella_DeferredNotImplemented();
	}

	unFreeze(){
		return paella_DeferredNotImplemented();
	}

	disable(isMainAudioPlayer) {
		console.log("Disable video requested");
	}

	enable(isMainAudioPlayer) {
		console.log("Enable video requested");
	}

	// Utility functions
	setClassName(className) {
		this.domElement.className = className;
	}

	_callReadyEvent() {
		paella.events.trigger(paella.events.singleVideoReady, { sender:this });
	}

	_callUnloadEvent() {
		paella.events.trigger(paella.events.singleVideoUnloaded, { sender:this });
	}
}

paella.VideoElementBase = VideoElementBase;

class EmptyVideo extends paella.VideoElementBase {
	constructor(id,stream,left,top,width,height) {
		super(id,stream,'div',left,top,width,height);
	}

	// Initialization functions
	setPosterFrame(url) {}
	setAutoplay(auto) {}
	load() {return paella_DeferredRejected(new Error("no such compatible video player")); }
	play() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	pause() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	isPaused() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	duration() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	setCurrentTime(time) { return paella_DeferredRejected(new Error("no such compatible video player")); }
	currentTime() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	setVolume(volume) { return paella_DeferredRejected(new Error("no such compatible video player")); }
	volume() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	setPlaybackRate(rate) { return paella_DeferredRejected(new Error("no such compatible video player")); }
	playbackRate() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	unFreeze() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	freeze() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	unload() { return paella_DeferredRejected(new Error("no such compatible video player")); }
	getDimensions() { return paella_DeferredRejected(new Error("no such compatible video player")); }
}

paella.EmptyVideo = EmptyVideo;

class EmptyVideoFactory extends paella.VideoFactory {
	isStreamCompatible(streamData) {
		return true;
	}

	getVideoObject(id, streamData, rect) {
		return new paella.EmptyVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
}

paella.videoFactories.EmptyVideoFactory = EmptyVideoFactory;

class Html5Video extends paella.VideoElementBase {
	constructor(id,stream,left,top,width,height,streamName) {
		super(id,stream,'video',left,top,width,height);

		this._currentQuality = null;
		this._autoplay = false;

		this._streamName = streamName || 'mp4';
		this._playbackRate = 1;

		if (this._stream.sources[this._streamName]) {
			this._stream.sources[this._streamName].sort(function (a, b) {
				return a.res.h - b.res.h;
			});
		}

		this.video.preload = "auto";
		this.video.setAttribute("playsinline","");
		//this.video.setAttribute("tabindex","-1");

		this._configureVideoEvents(this.video);
	}

	_configureVideoEvents(videoElement) {
		function onProgress(event) {
			if (!this._ready && this.video.readyState==4) {
				this._ready = true;
				if (this._initialCurrentTipe!==undefined) {
					this.video.currentTime = this._initialCurrentTime;
					delete this._initialCurrentTime;
				}
				this._callReadyEvent();
			}
		}


		let evtCallback = (event) => { onProgress.apply(this,[event]); }

		$(this.video).bind('progress', evtCallback);
		$(this.video).bind('loadstart',evtCallback);
		$(this.video).bind('loadedmetadata',evtCallback);
		$(this.video).bind('canplay',evtCallback);
		$(this.video).bind('oncanplay',evtCallback);

		// Save current time to resume video
		$(this.video).bind('timeupdate', (evt) => {
			this._resumeCurrentTime = this.video.currentTime;
		});

		$(this.video).bind('ended',(evt) => {
			paella.events.trigger(paella.events.endVideo);
		});

		$(this.video).bind('emptied', (evt) => {
			if (this._resumeCurrentTime && !isNaN(this._resumeCurrentTime)) {
				this.video.currentTime = this._resumeCurrentTime;
			}
		});
		
		// Fix safari setQuelity bug
		if (paella.utils.userAgent.browser.Safari) {
			$(this.video).bind('canplay canplaythrough', (evt) => {
				this._resumeCurrentTime && (this.video.currentTime = this._resumeCurrentTime);
			});
		}
	}
	
	get buffered() {
		return this.video && this.video.buffered;
	}

	get video() {
		if (this.domElementType=='video') {
			return this.domElement;
		}
		else {
			this._video = this._video || document.createElement('video');
			return this._video;
		}
	}

	get ready() {
		// Fix Firefox specific issue when video reaches the end
		if (paella.utils.userAgent.browser.Firefox &&
			this.video.currentTime==this.video.duration &&
			this.video.readyState==2)
		{
			this.video.currentTime = 0;
		}

		return this.video.readyState>=3;
	}

	// Synchronous functions: returns null if the resource is not loaded. Use only if 
	// the resource is loaded.
	get currentTimeSync() {
		return this.ready ? this.video.currentTime : null;
	}

	get volumeSync() {
		return this.ready ? this.video.volume : null;
	}

	get pausedSync() {
		return this.ready ? this.video.paused : null;
	}

	get durationSync() {
		return this.ready ? this.video.duration : null;
	}

	_deferredAction(action) {
		return new Promise((resolve,reject) => {
			function processResult(actionResult) {
				if (actionResult instanceof Promise) {
					actionResult.then((p) => resolve(p))
						.catch((err) => reject(err));
				}
				else {
					resolve(actionResult);
				}
			}

			if (this.ready) {
				processResult(action());
			}
			else {
				$(this.video).bind('canplay',() => {
					processResult(action());
					$(this.video).unbind('canplay');
					$(this.video).unbind('loadedmetadata');
				});
			}
		});
	}

	_getQualityObject(index, s) {
		return {
			index: index,
			res: s.res,
			src: s.src,
			toString:function() { return this.res.w==0 ? "auto" : this.res.w + "x" + this.res.h; },
			shortLabel:function() { return this.res.w==0 ? "auto" : this.res.h + "p"; },
			compare:function(q2) { return this.res.w*this.res.h - q2.res.w*q2.res.h; }
		};
	}

	captureFrame() {
		return new Promise((resolve) => {
			resolve({
				source:this.video,
				width:this.video.videoWidth,
				height:this.video.videoHeight
			});
		});
	}

	supportsCaptureFrame() {
		return Promise.resolve(true);
	}

	// Initialization functions
	getVideoData() {
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
	}
	
	setPosterFrame(url) {
		this._posterFrame = url;
	}

	setAutoplay(auto) {
		this._autoplay = auto;
		if (auto && this.video) {
			this.video.setAttribute("autoplay",auto);
		}
	}

	videoCanvas() {
		let canvasType = this._stream.canvas || ["video"];
		return paella.getVideoCanvas(canvasType);
	}

	webGlDidLoad() {
		return Promise.resolve();
	}

	load() {
		return new Promise((resolve,reject) => {
			var sources = this._stream.sources[this._streamName];
			if (this._currentQuality===null && this._videoQualityStrategy) {
				this._currentQuality = this._videoQualityStrategy.getQualityIndex(sources);
			}
	
			var stream = this._currentQuality<sources.length ? sources[this._currentQuality]:null;
			this.video.innerText = "";
			this.videoCanvas()
				.then((CanvasClass) => {
					let canvasInstance = new CanvasClass(stream);
					this._zoomAvailable = canvasInstance.allowZoom();

					if (window.$paella_bg && bg.app && canvasInstance instanceof bg.app.WindowController) {
						// WebGL canvas
						this.domElementType = 'canvas';
						if (stream) {

							// WebGL engine load callback
							return new Promise((webglResolve,webglReject) => {
								this.webGlDidLoad()
									.then(() => {
										this.canvasController = null;
										let mainLoop = bg.app.MainLoop.singleton;

										mainLoop.updateMode = bg.app.FrameUpdate.AUTO;
										mainLoop.canvas = this.domElement;
										mainLoop.run(canvasInstance);
										return this.loadVideoStream(canvasInstance,stream);
									})

									.then((canvas) => {
										webglResolve(canvas);
									})
									.catch((err) => webglReject(err));
							});
						}
						else {
							Promise.reject(new Error("Invalid stream data."));
						}
					}
					else {
						return this.loadVideoStream(canvasInstance,stream);
					}
				})
	
				.then((canvas) => {
					if (canvas && paella.WebGLCanvas && canvas instanceof paella.WebGLCanvas) {
						this._video = canvas.video;
						this._video.pause();
						this._configureVideoEvents(this.video);
					}
					resolve(stream);
				})
	
				.catch((err) => {
					reject(err);
				});
		});
	}

	loadVideoStream(canvasInstance,stream) {
		return canvasInstance.loadVideo(this,stream);
	}

	disable(isMainAudioPlayer) {
		//if (isMainAudioPlayer) return;
		//this._isDisabled = true;
		//this._playState = !this.video.paused;
		//this.video.pause();
	}

	enable(isMainAudioPlayer) {
		//if (isMainAudioPlayer) return;
		//this._isDisabled = false;
		//if (this._playState) {
		//	this.video.play();
		//}
	}

	getQualities() {
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
	}

	setQuality(index) {
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
	}

	getCurrentQuality() {
		return new Promise((resolve) => {	
			resolve(this._getQualityObject(this._currentQuality,this._stream.sources[this._streamName][this._currentQuality]));
		});
	}

	play() {
		return this._deferredAction(() => {
			if (!this._isDisabled) {
				return this.video.play();
			}
			else {
				return Promise.resolve();
			}
		});
	}

	pause() {
		return this._deferredAction(() => {
			if (!this._isDisabled) {
				return this.video.pause();
			}
			else {
				return Promise.resolve();
			}
		});
	}

	isPaused() {
		return this._deferredAction(() => {
			return this.video.paused;
		});
	}

	duration() {
		return this._deferredAction(() => {
			return this.video.duration;
		});
	}

	setCurrentTime(time) {
		return this._deferredAction(() => {
			(time == 0 || time) && !isNaN(time) && (this.video.currentTime = time);
		});
	}

	currentTime() {
		return this._deferredAction(() => {
			return this.video.currentTime;
		});
	}

	setVolume(volume) {
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
	}

	volume() {
		return this._deferredAction(() => {
			return this.video.volume;
		});
	}

	setPlaybackRate(rate) {
		return this._deferredAction(() => {
			this._playbackRate = rate;
			this.video.playbackRate = rate;
		});
	}

	playbackRate() {
		return this._deferredAction(() => {
			return this.video.playbackRate;
		});
	}

	supportAutoplay() {
		let macOS10_12_safari = paella.utils.userAgent.system.MacOS &&
								paella.utils.userAgent.system.Version.minor>=12 &&
								paella.utils.userAgent.browser.Safari;
		let iOS = paella.utils.userAgent.system.iOS;
		// Autoplay does not work from Chrome version 64
		let chrome_v64 =	paella.utils.userAgent.browser.Chrome &&
							paella.utils.userAgent.browser.Version.major==64;
		if (macOS10_12_safari || iOS || chrome_v64)
		{
			return false;
		}
		else {
			return true;
		}
	}

	goFullScreen() {
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
	}

	unFreeze(){
		return this._deferredAction(() => {
			var c = document.getElementById(this.video.id + "canvas");
			if (c) {
				$(c).remove();
			}
		});
	}
	
	freeze(){
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
	}

	unload() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	}

	getDimensions() {
		return paella_DeferredNotImplemented();
	}
}

paella.Html5Video = Html5Video;

paella.Html5Video.IsAutoplaySupported = function(debug = false) {
	return new Promise((resolve) => {
		// Create video element to test autoplay
		var video = document.createElement('video');
		video.src = 'data:video/mp4;base64,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';
		video.load();
		//video.style.display = 'none';
		if (debug) {
			video.style = "position: fixed; top: 0px; right: 0px; z-index: 1000000;";
			document.body.appendChild(video);
		}
		else {
			video.style.display = 'none';
		}
		video.playing = false;
		video.play().then((status) => {
				resolve(true);
			})
			.catch((err) => {
				resolve(false)
			})
	})
}

class Html5VideoFactory {
	isStreamCompatible(streamData) {
		try {
			if (paella.videoFactories.Html5VideoFactory.s_instances>0 && 
				paella.utils.userAgent.system.iOS &&
				(paella.utils.userAgent.system.Version.major<=10 && paella.utils.userAgent.system.Version.minor<3))
			{
				return false;
			}
			
			for (var key in streamData.sources) {
				if (key=='mp4' || key=='mp3') return true;
			}
		}
		catch (e) {}
		return false;
	}

	getVideoObject(id, streamData, rect) {
		++paella.videoFactories.Html5VideoFactory.s_instances;
		return new paella.Html5Video(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
}

paella.videoFactories.Html5VideoFactory = Html5VideoFactory;
paella.videoFactories.Html5VideoFactory.s_instances = 0;


class ImageVideo extends paella.VideoElementBase {
	
	constructor(id,stream,left,top,width,height) {
		super(id,stream,'img',left,top,width,height);

		this._posterFrame = null;
		this._currentQuality = null;
		this._currentTime = 0;
		this._duration =  0;
		this._ended = false;
		this._playTimer = null;
		this._playbackRate = 1;

		this._frameArray = null;
		
		this._stream.sources.image.sort(function(a,b) {
			return a.res.h - b.res.h;
		});
	}

	get img() { return this.domElement; }

	get imgStream() { this._stream.sources.image[this._currentQuality]; }

	get _paused() { return this._playTimer==null; }

	_deferredAction(action) {
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
	}

	_getQualityObject(index, s) {
		return {
			index: index,
			res: s.res,
			src: s.src,
			toString:function() { return Number(this.res.w) + "x" + Number(this.res.h); },
			shortLabel:function() { return this.res.h + "p"; },
			compare:function(q2) { return Number(this.res.w)*Number(this.res.h) - Number(q2.res.w)*Number(q2.res.h); }
		};
	}

	_loadCurrentFrame() {
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
	}

	// Initialization functions

	/*allowZoom:function() {
		return false;
	},*/

	getVideoData() {
		return new Promise((resolve) => {
			this._deferredAction(() => {
				let imgStream = this._stream.sources.image[this._currentQuality];
				var videoData = {
					duration: this._duration,
					currentTime: this._currentTime,
					volume: 0,
					paused: this._paused,
					ended: this._ended,
					res: {
						w: imgStream.res.w,
						h: imgStream.res.h
					}
				};
				resolve(videoData);
			});
		});
	}

	setPosterFrame(url) {
		this._posterFrame = url;
	}

	setAutoplay(auto) {
		this._autoplay = auto;
		if (auto && this.video) {
			this.video.setAttribute("autoplay",auto);
		}
	}

	load() {
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
	}

	supportAutoplay() {
		return true;
	}

	getQualities() {
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
	}

	setQuality(index) {
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
	}

	getCurrentQuality() {
		return new Promise((resolve) => {
			resolve(this._getQualityObject(this._currentQuality,this._stream.sources.image[this._currentQuality]));
		});
	}

	play() {
		let This = this;
		return this._deferredAction(() => {
			This._playTimer = new paella.utils.Timer(function() {
				This._currentTime += 0.25 * This._playbackRate;
				This._loadCurrentFrame();
			}, 250);
			This._playTimer.repeat = true;
		});
	}

	pause() {
		let This = this;
		return this._deferredAction(() => {
			This._playTimer.repeat = false;
			This._playTimer = null;
		});
	}

	isPaused() {
		return this._deferredAction(() => {
			return this._paused;
		});
	}

	duration() {
		return this._deferredAction(() => {
			return this._duration;
		});
	}

	setCurrentTime(time) {
		return this._deferredAction(() => {
			this._currentTime = time;
			this._loadCurrentFrame();
		});
	}

	currentTime() {
		return this._deferredAction(() => {
			return this._currentTime;
		});
	}

	setVolume(volume) {
		return this._deferredAction(function() {
			// No audo sources in image video
		});
	}

	volume() {
		return this._deferredAction(function() {
			// No audo sources in image video
			return 0;
		});
	}

	setPlaybackRate(rate) {
		return this._deferredAction(() => {
			this._playbackRate = rate;
		});
	}

	playbackRate() {
		return this._deferredAction(() => {
			return this._playbackRate;
		});
	}

	goFullScreen() {
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
	}

	unFreeze(){
		return this._deferredAction(function() {});
	}

	freeze(){
		return this._deferredAction(function() {});
	}

	unload() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	}

	getDimensions() {
		return paella_DeferredNotImplemented();
	}
}

paella.ImageVideo = ImageVideo;


class ImageVideoFactory {
	isStreamCompatible(streamData) {
		try {
			for (var key in streamData.sources) {
				if (key=='image') return true;
			}
		}
		catch (e) {}
		return false;
	}

	getVideoObject(id, streamData, rect) {
		return new paella.ImageVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
}

paella.videoFactories.ImageVideoFactory = ImageVideoFactory;

})();
