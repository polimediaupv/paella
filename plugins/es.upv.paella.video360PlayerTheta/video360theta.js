

function buildVideo360ThetaCanvas(stream, canvas) {
	function cyln2world(a, e) {
		return (new bg.Vector3(
			Math.cos(e) * Math.cos(a),
			Math.cos(e) * Math.sin(a),
			Math.sin(e)));
	}

	function world2fish(x, y, z) {
		let nz = z;
		if (z < -1.0) nz = -1.0;
		else if (z > 1.0) nz = 1.0;
		return (new bg.Vector2(
			Math.atan2(y, x),
			Math.acos(nz) / Math.PI)); // 0.0 to 1.0
	}

	function calcTexUv(i, j, lens) {
		const world = cyln2world(
			((i + 90) / 180.0 - 1.0) * Math.PI, // rotate 90 deg for polygon
			(0.5 - j / 180.0) * Math.PI);
		const ar = world2fish(
			Math.sin(-0.5 * Math.PI) * world.z + Math.cos(-0.5 * Math.PI) * world.x,
			world.y,
			Math.cos(-0.5 * Math.PI) * world.z - Math.sin(-0.5 * Math.PI) * world.x);

		const fishRad = 0.883;
		const fishRad2 = fishRad * 0.88888888888888;
		const fishCenter = 1.0 - 0.44444444444444;
		const x = (lens === 0) ?
			fishRad * ar.y * Math.cos(ar.x) * 0.5 + 0.25 :
			fishRad * (1.0 - ar.y) * Math.cos(-1.0 * ar.x + Math.PI) * 0.5 + 0.75;
		const y = (lens === 0) ?
			fishRad2 * ar.y * Math.sin(ar.x) + fishCenter :
			fishRad2 * (1.0 - ar.y) * Math.sin(-1.0 * ar.x + Math.PI) + fishCenter;
		return (new bg.Vector2(x, y));
	}

	function buildViewerNode(ctx) {
		let radius = 1;
		let node = new bg.scene.Node(ctx);
		let drw = new bg.scene.Drawable();
		node.addComponent(drw);

		let plist = new bg.base.PolyList(ctx);

		let vertex = [];
		let normals = [];
		let uvs = [];
		let index = [];
		for (let j = 0; j <= 180; j += 5) {
			for (let i = 0; i <= 360; i += 5) {
				vertex.push(new bg.Vector3(Math.sin(Math.PI * j / 180.0) * Math.sin(Math.PI * i / 180.0) * radius,
										   Math.cos(Math.PI * j / 180.0) * radius,
										   Math.sin(Math.PI * j / 180.0) * Math.cos(Math.PI * i / 180.0) * radius));

				normals.push(new bg.Vector3(0, 0, -1));
			}
			/* devide texture */
			for (let k = 0; k <= 180; k += 5) {
				uvs.push(calcTexUv(k, j, 0));
			}
			for (let l = 180; l <= 360; l += 5) {
				uvs.push(calcTexUv(l, j, 1));
			}
		}

		function addFace(v0, v1, v2, n0, n1, n2, uv0, uv1, uv2) {
			plist.vertex.push(v0.x); plist.vertex.push(v0.y); plist.vertex.push(v0.z);
			plist.vertex.push(v1.x); plist.vertex.push(v1.y); plist.vertex.push(v1.z);
			plist.vertex.push(v2.x); plist.vertex.push(v2.y); plist.vertex.push(v2.z);

			plist.normal.push(n0.x); plist.normal.push(n0.y); plist.normal.push(n0.z);
			plist.normal.push(n1.x); plist.normal.push(n1.y); plist.normal.push(n1.z);
			plist.normal.push(n2.x); plist.normal.push(n2.z); plist.normal.push(n2.z);

			plist.texCoord0.push(uv0.x); plist.texCoord0.push(uv0.y);
			plist.texCoord0.push(uv1.x); plist.texCoord0.push(uv1.y);
			plist.texCoord0.push(uv2.x); plist.texCoord0.push(uv2.y);

			plist.index.push(plist.index.length);
			plist.index.push(plist.index.length);
			plist.index.push(plist.index.length);
		}

		for (let m = 0; m < 36; m++) {
			for (let n = 0; n < 72; n++) {
				const v = m * 73 + n;
				const t = (n < 36) ? m * 74 + n : m * 74 + n + 1;
				([uvs[t + 0], uvs[t + 1], uvs[t + 74]], [uvs[t + 1], uvs[t + 75], uvs[t + 74]]);

				let v0 = vertex[v + 0];	 let n0 = normals[v + 0];	let uv0 = uvs[t + 0];
				let v1 = vertex[v + 1];  let n1 = normals[v + 1];	let uv1 = uvs[t + 1];
				let v2 = vertex[v + 73]; let n2 = normals[v + 73];	let uv2 = uvs[t + 74];
				let v3 = vertex[v + 74]; let n3 = normals[v + 74];	let uv3 = uvs[t + 75];

				addFace(v0, v1, v2, n0, n1, n2, uv0, uv1, uv2);
				addFace(v1, v3, v2, n1, n3, n2, uv1, uv3, uv2);
			}
		}
		plist.build();

		drw.addPolyList(plist);

		let trx = bg.Matrix4.Scale(-1,1,1);
		node.addComponent(new bg.scene.Transform(trx));

		return node;
	}

class Video360ThetaCanvas extends bg.app.WindowController {

	constructor(stream) {
		super();
		this.stream = stream;
	}

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

	buildScene() {
		this._root = new bg.scene.Node(this.gl, "Root node");
		
		bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin());
		bg.base.Loader.RegisterPlugin(new bg.base.VideoTextureLoaderPlugin());
		bg.base.Loader.RegisterPlugin(new bg.base.VWGLBLoaderPlugin());
		
		bg.base.Loader.Load(this.gl,this.stream.src)
			.then((texture) => {
				this.texture = texture;
				//let sphere = bg.scene.PrimitiveFactory.Sphere(this.gl,1,50);
				//let sphereNode = new bg.scene.Node(this.gl);

				let viewerNode = buildViewerNode(this.gl);
				let sphere = viewerNode.component("bg.scene.Drawable");
				sphere.getMaterial(0).texture = texture;
				sphere.getMaterial(0).lightEmission = 1.0;
				sphere.getMaterial(0).lightEmissionMaskInvert = true;
				sphere.getMaterial(0).cullFace = false;
				this._root.addChild(viewerNode );
				this.postRedisplay();
			});
		
		let lightNode = new bg.scene.Node(this.gl,"Light");
		this._root.addChild(lightNode);
		
		this._camera = new bg.scene.Camera();
		let cameraNode = new bg.scene.Node("Camera");
		cameraNode.addComponent(this._camera);			
		cameraNode.addComponent(new bg.scene.Transform());
		let oc = new bg.manipulation.OrbitCameraController();
		cameraNode.addComponent(oc);
		oc.maxPitch = 90;
		oc.minPitch = -90;
		oc.maxDistance = 0;
		oc.minDistace = 0;
		this._root.addChild(cameraNode);
	}
	
	init() {
		bg.Engine.Set(new bg.webgl1.Engine(this.gl));
		
		this.buildScene();
		
		this._renderer = bg.render.Renderer.Create(this.gl,bg.render.RenderPath.FORWARD);
		
		this._inputVisitor = new bg.scene.InputVisitor();
	}
	
	frame(delta) {
		if (this.texture) {
			this.texture.update();
		}
		this._renderer.frame(this._root, delta);
	}
	
	display() { this._renderer.display(this._root, this._camera); }
	
	reshape(width,height) {
		this._camera.viewport = new bg.Viewport(0,0,width,height);
		this._camera.projection.perspective(60,this._camera.viewport.aspectRatio,0.1,100);
	}
	
	// Pass the input events to the scene
	mouseDown(evt) {
		this._inputVisitor.mouseDown(this._root,evt);
	}
	
	mouseDrag(evt) {
		this._inputVisitor.mouseDrag(this._root,evt);
		this.postRedisplay();
	}
	
	mouseWheel(evt) {
		this._inputVisitor.mouseWheel(this._root,evt);
		this.postRedisplay();
	}
	
	touchStart(evt) {
		this._inputVisitor.touchStart(this._root,evt);
	}
	
	touchMove(evt) {
		this._inputVisitor.touchMove(this._root,evt);
		this.postRedisplay();
	}
	
	// You may pass also the following events, but they aren't used by the camera controller
	mouseUp(evt) { this._inputVisitor.mouseUp(this._root,evt); }
	mouseMove(evt) { this._inputVisitor.mouseMove(this._root,evt); }
	mouseOut(evt) { this._inputVisitor.mouseOut(this._root,evt); }
	touchEnd(evt) { this._inputVisitor.touchEnd(this._root,evt); }
	}

	let controller = new Video360ThetaCanvas(stream);
	let mainLoop = bg.app.MainLoop.singleton;

	mainLoop.updateMode = bg.app.FrameUpdate.AUTO;
	mainLoop.canvas = canvas;
	mainLoop.run(controller);

	return controller.loaded();
}

Class ("paella.Video360Theta", paella.VideoElementBase,{
	_posterFrame:null,
	_currentQuality:null,
	_autoplay:false,
	_streamName:null,

	initialize:function(id,stream,left,top,width,height,streamName) {
		//this.parent(id,stream,'canvas',left,top,width,height);
		this.parent(id,stream,'canvas',0,0,1280,720);
		this._streamName = streamName || 'video360theta';
		var This = this;

		paella.player.videoContainer.disablePlayOnClick();

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
				//This.canvasController.reshape($(canvas).width(),$(canvas).height());
			}
		}

		let timer = new paella.Timer(function(timer) {
			onUpdateSize();
		},500);
		timer.repeat = true;
	},

	defaultProfile:function() {
		return 'chroma';
	},

	_setVideoElem:function(video) {
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
					this.video = null;
					if (stream) {
						this.canvasController = null;
						buildVideo360ThetaCanvas(stream,this.domElement)
							.then((canvasController) => {
								this.canvasController = canvasController;
								this.video = canvasController.video;
								this.video.pause();
								resolve(stream);
							});
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
			bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.AUTO;
            this.video.play();
        });
	},

	pause:function() {
        return this._deferredAction(() => {
			bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL;
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
			$(this.video).on('seeked',() => {
				this.canvasController.postRedisplay();
				$(this.video).off('seeked');
			});
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


Class ("paella.videoFactories.Video360ThetaFactory", {
	isStreamCompatible:function(streamData) {
		try {
			if (paella.ChromaVideo._loaded) {
				return false;
			}
			if (paella.videoFactories.Html5VideoFactory.s_instances>0 && 
				base.userAgent.system.iOS)
			{
				return false;
			}
			for (var key in streamData.sources) {
				if (key=='video360theta') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		paella.ChromaVideo._loaded = true;
		++paella.videoFactories.Html5VideoFactory.s_instances;
		return new paella.Video360Theta(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});