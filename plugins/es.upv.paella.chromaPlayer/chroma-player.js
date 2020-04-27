

(() => {

	function buildChromaVideoCanvas(stream, canvas) {
		class ChromaVideoCanvas extends bg.app.WindowController {
	
			constructor(stream) {
				super();
				this.stream = stream;
				this._chroma = bg.Color.White();
				this._crop = new bg.Vector4(0.3,0.01,0.3,0.01);
				this._transform = bg.Matrix4.Identity().translate(0.6,-0.04,0);
				this._bias = 0.01;
			}
	
			get chroma() { return this._chroma; }
			get bias() { return this._bias; }
			get crop() { return this._crop; }
			get transform() { return this._transform; }
			set chroma(c) { this._chroma = c; }
			set bias(b) { this._bias = b; }
			set crop(c) { this._crop = c; }
			set transform(t) { this._transform = t; }
	
			get video() {
				return this.texture ? this.texture.video : null;
			}
	
			loaded() {
				return new Promise((resolve) => {
					let checkLoaded = () => {
						if (this.video) {
							resolve(this);
						}
						else {
							setTimeout(checkLoaded,100);
						}
					}
					checkLoaded();
				});
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
						uniform mat4 inTransform;
						varying vec2 vTexCoord;
						void main() {
							gl_Position = inTransform * position;
							vTexCoord = texCoord;
						}
					`;
				let fshader = `
						precision mediump float;
						varying vec2 vTexCoord;
						uniform sampler2D inTexture;
						uniform vec4 inChroma;
						uniform float inBias;
						uniform vec4 inCrop;
						void main() {
							vec4 result = texture2D(inTexture,vTexCoord);
							
							if ((result.r>=inChroma.r-inBias && result.r<=inChroma.r+inBias &&
								result.g>=inChroma.g-inBias && result.g<=inChroma.g+inBias &&
								result.b>=inChroma.b-inBias && result.b<=inChroma.b+inBias) ||
								(vTexCoord.x<inCrop.x || vTexCoord.x>inCrop.z || vTexCoord.y<inCrop.w || vTexCoord.y>inCrop.y)
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
				
				this.shader.initVars(["position","texCoord"],["inTransform","inTexture","inChroma","inBias","inCrop"]);
			}
			
			init() {
				// Use WebGL V1 engine
				bg.Engine.Set(new bg.webgl1.Engine(this.gl));
	
				bg.base.Loader.RegisterPlugin(new bg.base.VideoTextureLoaderPlugin());
				
				this.buildShape();
				this.buildShader();
						
				this.pipeline = new bg.base.Pipeline(this.gl);
				bg.base.Pipeline.SetCurrent(this.pipeline);
				this.pipeline.clearColor = bg.Color.Transparent();
	
				bg.base.Loader.Load(this.gl,this.stream.src)
					.then((texture) => {
						this.texture = texture;
					});
			}
	
			frame(delta) {
				if (this.texture) {
					this.texture.update();
				}
			}
			
			display() {
				this.pipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
				
				if (this.texture) {
					this.shader.setActive();
					this.shader.setInputBuffer("position",this.plist.vertexBuffer,3);
					this.shader.setInputBuffer("texCoord",this.plist.texCoord0Buffer,2);
					this.shader.setMatrix4("inTransform",this.transform);
					this.shader.setTexture("inTexture",this.texture || bg.base.TextureCache.WhiteTexture(this.gl),bg.base.TextureUnit.TEXTURE_0);
					this.shader.setVector4("inChroma",this.chroma);
					this.shader.setValueFloat("inBias",this.bias);
					this.shader.setVector4("inCrop",new bg.Vector4(this.crop.x, 1.0 - this.crop.y, 1.0 - this.crop.z, this.crop.w));
					this.plist.draw();
					
					this.shader.disableInputBuffer("position");
					this.shader.disableInputBuffer("texCoord");
					this.shader.clearActive();
				}
			}
			
			reshape(width,height) {
				let canvas = this.canvas.domElement;
				canvas.width = width;
				canvas.height = height;
				this.pipeline.viewport = new bg.Viewport(0,0,width,height);
			}
			
			mouseMove(evt) { this.postRedisplay(); }
		}
	
		let controller = new ChromaVideoCanvas(stream);
		let mainLoop = bg.app.MainLoop.singleton;
	
		mainLoop.updateMode = bg.app.FrameUpdate.AUTO;
		mainLoop.canvas = canvas;
		mainLoop.run(controller);
	
		return controller.loaded();
	}
	
	class ChromaVideo extends paella.VideoElementBase {
		
		constructor(id,stream,left,top,width,height,streamName) {
			super(id,stream,'canvas',left,top,width,height);

			this._posterFrame = null;
			this._currentQuality = null;
			this._autoplay = false;
			this._streamName = null;
			this._streamName = streamName || 'chroma';
			var This = this;
	
			if (this._stream.sources[this._streamName]) {
				this._stream.sources[this._streamName].sort(function (a, b) {
					return a.res.h - b.res.h;
				});
			}
	
			this.video = null;
	
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
	
			function onUpdateSize() {
				if (This.canvasController) {
					let canvas = This.canvasController.canvas.domElement;
					This.canvasController.reshape($(canvas).width(),$(canvas).height());
				}
			}
	
			let timer = new paella.Timer(function(timer) {
				onUpdateSize();
			},500);
			timer.repeat = true;
		}
	
		defaultProfile() {
			return 'chroma';
		}
	
		_setVideoElem(video) {
			$(this.video).bind('progress', evtCallback);
			$(this.video).bind('loadstart',evtCallback);
			$(this.video).bind('loadedmetadata',evtCallback);
			$(this.video).bind('canplay',evtCallback);
			$(this.video).bind('oncanplay',evtCallback);
		}
	
		_loadDeps() {
			return new Promise((resolve,reject) => {
				if (!window.$paella_bg2e) {
					paella.require(paella.baseUrl + 'javascript/bg2e-es2015.js')
						.then(() => {
							window.$paella_bg2e = bg;
							resolve(window.$paella_bg2e);
						})
						.catch((err) => {
							console.error(err.message);
							reject();
						});
				}
				else {
					defer.resolve(window.$paella_bg2e);
				}
			});
		}
	
		_deferredAction(action) {
			return new Promise((resolve,reject) => {
				if (this.video) {
					resolve(action());
				}
				else {
					$(this.video).bind('canplay',() => {
						this._ready = true;
						resolve(action());
					});
				}
			});
		}
	
		_getQualityObject(index, s) {
			return {
				index: index,
				res: s.res,
				src: s.src,
				toString:function() { return this.res.w + "x" + this.res.h; },
				shortLabel:function() { return this.res.h + "p"; },
				compare:function(q2) { return this.res.w*this.res.h - q2.res.w*q2.res.h; }
			};
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
	
		load() {
			var This = this;
			return new Promise((resolve,reject) => {
				this._loadDeps() 
					.then(() => {
						var sources = this._stream.sources[this._streamName];
						if (this._currentQuality===null && this._videoQualityStrategy) {
							this._currentQuality = this._videoQualityStrategy.getQualityIndex(sources);
						}
	
						var stream = this._currentQuality<sources.length ? sources[this._currentQuality]:null;
						this.video = null;
						this.domElement.parentNode.style.backgroundColor = "transparent";
						if (stream) {
							this.canvasController = null;
							buildChromaVideoCanvas(stream,this.domElement)
								.then((canvasController) => {
									this.canvasController = canvasController;
									this.video = canvasController.video;
									this.video.pause();
									if (stream.crop) {
										this.canvasController.crop = new bg.Vector4(stream.crop.left,stream.crop.top,stream.crop.right,stream.crop.bottom);
									}
									if (stream.displacement) {
										this.canvasController.transform = bg.Matrix4.Translation(stream.displacement.x, stream.displacement.y, 0);
									}
									if (stream.chromaColor) {
										this.canvasController.chroma = new bg.Color(stream.chromaColor[0],
																						 stream.chromaColor[1],
																						 stream.chromaColor[2],
																						 stream.chromaColor[3])
									}
									if (stream.chromaBias) {
										this.canvasController.bias = stream.chromaBias;
									}
									resolve(stream);
								});
						}
						else {
							reject(new Error("Could not load video: invalid quality stream index"));
						}
					});
			});
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
		}
	
		getCurrentQuality() {
			return new Promise((resolve) => {	
				resolve(this._getQualityObject(this._currentQuality,this._stream.sources[this._streamName][this._currentQuality]));
			});
		}
	
		play() {
			return this._deferredAction(() => {
				bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.AUTO;
				this.video.play();
			});
		}
	
		pause() {
			return this._deferredAction(() => {
				bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL;
				this.video.pause();
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
				this.video.currentTime = time;
				$(this.video).on('seeked',() => {
					this.canvasController.postRedisplay();
					$(this.video).off('seeked');
				});
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
			});
		}
	
		volume() {
			return this._deferredAction(() => {
				return this.video.volume;
			});
		}
	
		setPlaybackRate(rate) {
			return this._deferredAction(() => {
				this.video.playbackRate = rate;
			});
		}
	
		playbackRate() {
			return this._deferredAction(() => {
				return this.video.playbackRate;
			});
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
				var c = document.getElementById(this.video.className + "canvas");
				$(c).remove();
			});
		}
		
		freeze(){
			var This = this;
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
	
	paella.ChromaVideo = ChromaVideo;
	
	class ChromaVideoFactory extends paella.VideoFactory {
		isStreamCompatible(streamData) {
			try {
				if (paella.ChromaVideo._loaded) {
					return false;
				}
				if (paella.videoFactories.Html5VideoFactory.s_instances>0 && 
					paella.utils.userAgent.system.iOS)
				{
					return false;
				}
				for (var key in streamData.sources) {
					if (key=='chroma') return true;
				}
			}
			catch (e) {}
			return false;
		}
	
		getVideoObject(id, streamData, rect) {
			paella.ChromaVideo._loaded = true;
			++paella.videoFactories.Html5VideoFactory.s_instances;
			return new paella.ChromaVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
		}
	}

	paella.videoFactories.ChromaVideoFactory = ChromaVideoFactory;

})();
