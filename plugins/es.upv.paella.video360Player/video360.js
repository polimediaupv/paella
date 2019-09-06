
(() => {

function buildVideo360Canvas(stream, canvas) {
	class Video360Canvas extends bg.app.WindowController {

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
				let sphere = bg.scene.PrimitiveFactory.Sphere(this.gl,1,50);
				let sphereNode = new bg.scene.Node(this.gl);
				sphereNode.addComponent(sphere);
				sphere.getMaterial(0).texture = texture;
				sphere.getMaterial(0).lightEmission = 0.0;
				sphere.getMaterial(0).lightEmissionMaskInvert = false;
				sphere.getMaterial(0).cullFace = false;
				sphereNode.addComponent(new bg.scene.Transform(bg.Matrix4.Scale(1,-1,1)));
				this._root.addChild(sphereNode);
			});
		
		let lightNode = new bg.scene.Node(this.gl,"Light");
		let l = new bg.base.Light();
		l.ambient = bg.Color.White();
		l.diffuse = bg.Color.Black();
		l.specular = bg.Color.Black();
		lightNode.addComponent(new bg.scene.Light(l));
		this._root.addChild(lightNode);
		
		this._camera = new bg.scene.Camera();
		let cameraNode = new bg.scene.Node("Camera");
		cameraNode.addComponent(this._camera);			
		cameraNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(0,0,0)));
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
		this.postReshape();
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

	let controller = new Video360Canvas(stream);
	let mainLoop = bg.app.MainLoop.singleton;

	mainLoop.updateMode = bg.app.FrameUpdate.AUTO;
	mainLoop.canvas = canvas;
	mainLoop.run(controller);

	return controller.loaded();
}

paella.addCanvasPlugin("video360", true, true, () => {
	return class Video360Canvas extends paella.WebGLCanvas {
		constructor(stream) {
			super(stream);
		}

		loadVideo(videoPlugin,stream) {
			return new Promise((resolve,reject) => {
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

		buildVideoSurface(sceneRoot,videoTexture) {
			let sphere = bg.scene.PrimitiveFactory.Sphere(this.gl,1,50);
			let sphereNode = new bg.scene.Node(this.gl);
			sphereNode.addComponent(sphere);
			sphere.getMaterial(0).texture = videoTexture;
			sphere.getMaterial(0).lightEmission = 0;
			sphere.getMaterial(0).lightEmissionMaskInvert = false;
			sphere.getMaterial(0).cullFace = false;
			sphereNode.addComponent(new bg.scene.Transform(bg.Matrix4.Scale(1,-1,1)));
			sceneRoot.addChild(sphereNode);
		}

		buildCamera() {
			let cameraNode = new bg.scene.Node(this.gl,"Camera");
			let camera = new bg.scene.Camera()
			cameraNode.addComponent(camera);
			cameraNode.addComponent(new bg.scene.Transform());
			let projection = new bg.scene.OpticalProjectionStrategy();
			projection.far = 100;
			projection.focalLength = 55;
			camera.projectionStrategy = projection;

			let oc = new bg.manipulation.OrbitCameraController();
			oc.maxPitch = 90;
			oc.minPitch = -90;
			oc.maxDistance = 0;
			oc.minDistance = 0;
			this._cameraController = oc;
			cameraNode.addComponent(oc);

			return cameraNode;
		}
	}
});

})();