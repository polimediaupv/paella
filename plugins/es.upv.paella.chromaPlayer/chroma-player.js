

function buildChromaVideoCanvas(video, canvas) {
	class ChromaVideoCanvas extends bg.app.WindowController {

		constructor(video) {
			super();
			this.video = video;
		}

		buildShape() {
			this.plist = new bg.base.PolyList(this.gl);
			
			this.plist.vertex = [ -1,-1,0, 1,-1,0, 1,1,0, -1,1,0, ];
			this.plist.texCoord0 = [ 0,0, 1,0, 1,1, 0,1 ];
			this.plist.index = [ 0, 1, 2, 2, 3, 0 ];
			
			this.plist.build();
		}
		
		buildShader() {
			let vshader = `
					attribute vec4 position;
					attribute vec2 texCoord;
					varying vec2 vTexCoord;
					void main() {
						gl_Position = position;
						vTexCoord = texCoord;
					}
				`;
			let fshader = `
					precision mediump float;
					varying vec2 vTexCoord;
					uniform sampler2D inTexture;
					uniform vec4 inChroma;
					void main() {
						vec4 result = texture2D(inTexture,vTexCoord);
						float tolerance = 0.5;
						if (result.r>=inChroma.r-tolerance && result.r<=inChroma.r+tolerance &&
							result.g>=inChroma.g-tolerance && result.g<=inChroma.g+tolerance &&
							result.b>=inChroma.b-tolerance && result.b<=inChroma.b+tolerance
						)
						{
							discard;
						}
						else {
							gl_FragColor = result;
						}
					}
				`;
			
			this.shader = new bg.base.Shader(this.gl);
			this.shader.addShaderSource(bg.base.ShaderType.VERTEX, vshader);

			this.shader.addShaderSource(bg.base.ShaderType.FRAGMENT, fshader);

			status = this.shader.link();
			if (!this.shader.status) {
				console.log(this.shader.compileError);
				console.log(this.shader.linkError);
			}
			
			this.shader.initVars(["position","texCoord"],["inTexture","inChroma"]);
		}
		
		init() {
			// Use WebGL V1 engine
			bg.Engine.Set(new bg.webgl1.Engine(this.gl));
			
			this.buildShape();
			this.buildShader();
					
			this.pipeline = new bg.base.Pipeline(this.gl);
			bg.base.Pipeline.SetCurrent(this.pipeline);
			this.pipeline.clearColor = bg.Color.Transparent();

			let gl = this.gl;

			this.video.texture = new bg.base.Texture(this.gl);
			this.video.texture.create();
			this.video.texture.bind();
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}

		updateTexture() {
			let gl = this.gl;
			this.video.texture.bind();
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.video);
		}
		
		frame(delta) {
			this.updateTexture();
		}
		
		display() {
			this.pipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
			
			this.shader.setActive();
			this.shader.setInputBuffer("position",this.plist.vertexBuffer,3);
			this.shader.setInputBuffer("texCoord",this.plist.texCoord0Buffer,2);
			this.shader.setTexture("inTexture",this.video.texture || bg.base.TextureCache.WhiteTexture(this.gl),bg.base.TextureUnit.TEXTURE_0);
			this.shader.setVector4("inChroma",new bg.Color(1,1,1,1));
			
			this.plist.draw();
			
			this.shader.disableInputBuffer("position");
			this.shader.disableInputBuffer("texCoord");
			this.shader.clearActive();
		}
		
		reshape(width,height) {
			this.pipeline.viewport = new bg.Viewport(0,0,width,height);
		}
		
		mouseMove(evt) { this.postRedisplay(); }
	}

	let controller = new ChromaVideoCanvas(video);
	let mainLoop = bg.app.MainLoop.singleton;

	mainLoop.updateMode = bg.app.FrameUpdate.AUTO;
	mainLoop.canvas = canvas;
	mainLoop.run(controller);

	return controller;
}

Class ("paella.ChromaVideo", paella.VideoElementBase,{
	_posterFrame:null,
	_currentQuality:null,
	_autoplay:false,
	_streamName:null,

	initialize:function(id,stream,left,top,width,height,streamName) {
		this.parent(id,stream,'canvas',left,top,width,height);
		this._streamName = streamName || 'mp4';
		var This = this;

		if (this._stream.sources[this._streamName]) {
			this._stream.sources[this._streamName].sort(function (a, b) {
				return a.res.h - b.res.h;
			});
		}

		this.video = document.createElement('video');
		this.video.width = 1280;
		this.video.height = 720;
		this.video.crossOrigin = "";

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

	_loadDeps:function() {
		return new Promise((resolve,reject) => {
			if (!window.$paella_mpd) {
				require(['resources/deps/bg2e.js'],function() {
					window.$paella_bg2e = true;
					resolve(window.$paella_bg2e);
				});
			}
			else {
				defer.resolve(window.$paella_mpd);
			}	
		});
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
		return new Promise((resolve,reject) => {
			this._loadDeps() 
				.then(() => {
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

						this.canvasController = buildChromaVideoCanvas(this.video,this.domElement);

						resolve(stream);
					}
					else {
						reject(new Error("Could not load video: invalid quality stream index"));
					}
				});
		});
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
			this.freeze()

				.then(() => {
					this._ready = false;
					return this.load();
				})

				.then(() => {
					if (!paused) {
						this.play();
					}
					$(this.video).on('seeked',() => {
						this.unFreeze();
						resolve();
						$(this.video).off('seeked');
					});
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
        });
	},

	volume:function() {
		return this._deferredAction(() => {
            return this.video.volume;
        });
	},

	setPlaybackRate:function(rate) {
		return this._deferredAction(() => {
            this.video.playbackRate = rate;
        });
	},

	playbackRate: function() {
        return this._deferredAction(() => {
            return this.video.playbackRate;
        });
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
			var c = document.getElementById(this.video.className + "canvas");
			$(c).remove();
		});
	},
	
	freeze:function(){
		var This = this;
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


Class ("paella.videoFactories.ChromaVideoFactory", {
	isStreamCompatible:function(streamData) {
		try {
			if (paella.ChromaVideo._loaded) {
				return false;
			}
			if (base.userAgent.system.iOS || base.userAgent.system.Android) {
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
		paella.ChromaVideo._loaded = true;
		return new paella.ChromaVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});