
(() => {

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