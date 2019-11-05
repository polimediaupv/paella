
(() => {

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

			plist.texCoord0.push(uv0.x); plist.texCoord0.push(1 - uv0.y);
			plist.texCoord0.push(uv1.x); plist.texCoord0.push(1 - uv1.y);
			plist.texCoord0.push(uv2.x); plist.texCoord0.push(1 - uv2.y);

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

	paella.addCanvasPlugin("video360Theta", true, true, () => {
		return class Video360ThetaCanvas extends paella.WebGLCanvas {
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
				let sphereNode = buildViewerNode(this.gl);
				let sphere = sphereNode.drawable;
				sphere.getMaterial(0).texture = videoTexture;
				sphere.getMaterial(0).lightEmission = 0;
				sphere.getMaterial(0).lightEmissionMaskInvert = false;
				sphere.getMaterial(0).cullFace = false;
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
