(function() {

    class VideoCanvas {
        constructor(stream) {
            this._stream = stream;
        }

        loadVideo(videoPlugin,stream) {
            return Promise.reject(new Error("Not implemented"));
        }

        allowZoom() {
            return true;
        }
    }

    paella.VideoCanvas = VideoCanvas;

    function initWebGLCanvas() {
        if (!paella.WebGLCanvas) {
        
            class WebGLCanvas extends bg.app.WindowController {
                constructor(stream) {
                    super();
                    this._stream = stream;
                }

                get stream() { return this._stream; }

                get video() { return this.texture ? this.texture.video : null; }

                get camera() { return this._camera; }

                get texture() { return this._texture; }

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

                loadVideo(videoPlugin,stream) {
                    return Promise.reject(new Error("Not implemented"));
                }

                allowZoom() {
                    return false;
                }

                // WebGL engine functions
                registerPlugins() {
                    bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin());
                    bg.base.Loader.RegisterPlugin(new bg.base.VideoTextureLoaderPlugin());
                    bg.base.Loader.RegisterPlugin(new bg.base.VWGLBLoaderPlugin());
                }

                loadVideoTexture() {
                    return bg.base.Loader.Load(this.gl, this.stream.src);
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
                    let camera = new bg.scene.Camera();
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

                buildScene() {
                    this._root = new bg.scene.Node(this.gl, "Root node");

                    this.registerPlugins();

                    this.loadVideoTexture()
                        .then((texture) => {
                            this._texture = texture;
                            this.buildVideoSurface(this._root,texture);
                        });

                    let lightNode = new bg.scene.Node(this.gl,"Light");
                    let light = new bg.base.Light();
                    light.ambient = bg.Color.White();
                    light.diffuse = bg.Color.Black();
                    light.specular = bg.Color.Black();
                    lightNode.addComponent(new bg.scene.Light(light));
                    this._root.addChild(lightNode);

                    let cameraNode = this.buildCamera();
                    this._camera = cameraNode.component("bg.scene.Camera");
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
                    this._renderer.frame(this._root,delta);
                    this.postReshape();
                }

                display() {
                    this._renderer.display(this._root, this._camera);
                }

                reshape(width,height) {
                    this._camera.viewport = new bg.Viewport(0,0,width,height);
                    if (!this._camera.projectionStrategy) {
                        this._camera.projection.perspective(60,this._camera.viewport.aspectRatio,0.1,100);
                    }
                }

                mouseDrag(evt) {
                    this._inputVisitor.mouseDrag(this._root,evt);
                    this.postRedisplay();
                }
                
                mouseWheel(evt) {
                    this._inputVisitor.mouseWheel(this._root,evt);
                    this.postRedisplay();
                }
                
                touchMove(evt) {
                    this._inputVisitor.touchMove(this._root,evt);
                    this.postRedisplay();
                }
                
                mouseDown(evt) { this._inputVisitor.mouseDown(this._root,evt); }
                touchStar(evt) { this._inputVisitor.touchStar(this._root,evt); }
                mouseUp(evt) { this._inputVisitor.mouseUp(this._root,evt); }
                mouseMove(evt) { this._inputVisitor.mouseMove(this._root,evt); }
                mouseOut(evt) { this._inputVisitor.mouseOut(this._root,evt); }
                touchEnd(evt) { this._inputVisitor.touchEnd(this._root,evt); }
            }

            paella.WebGLCanvas = WebGLCanvas;
        }
    }

    function buildVideoCanvas(stream) {
        if (!paella.WebGLCanvas) {
            class WebGLCanvas extends bg.app.WindowController {
                constructor(stream) {
                    super();
                    this._stream = stream;
                }

                get stream() { return this._stream; }

                get video() { return this.texture ? this.texture.video : null; }

                get camera() { return this._camera; }

                get texture() { return this._texture; }

                allowZoom() {
                    return false;
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

                registerPlugins() {
                    bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin());
                    bg.base.Loader.RegisterPlugin(new bg.base.VideoTextureLoaderPlugin());
                    bg.base.Loader.RegisterPlugin(new bg.base.VWGLBLoaderPlugin());
                }

                loadVideoTexture() {
                    return bg.base.Loader.Load(this.gl, this.stream.src);
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
                    let camera = new bg.scene.Camera();
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

                buildScene() {
                    this._root = new bg.scene.Node(this.gl, "Root node");

                    this.registerPlugins();

                    this.loadVideoTexture()
                        .then((texture) => {
                            this._texture = texture;
                            this.buildVideoSurface(this._root,texture);
                        });

                    let lightNode = new bg.scene.Node(this.gl,"Light");
                    let light = new bg.base.Light();
                    light.ambient = bg.Color.White();
                    light.diffuse = bg.Color.Black();
                    light.specular = bg.Color.Black();
                    lightNode.addComponent(new bg.scene.Light(light));
                    this._root.addChild(lightNode);

                    let cameraNode = this.buildCamera();
                    this._camera = cameraNode.component("bg.scene.Camera");
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
                    this._renderer.frame(this._root,delta);
                    this.postReshape();
                }

                display() {
                    this._renderer.display(this._root, this._camera);
                }

                reshape(width,height) {
                    this._camera.viewport = new bg.Viewport(0,0,width,height);
                    if (!this._camera.projectionStrategy) {
                        this._camera.projection.perspective(60,this._camera.viewport.aspectRatio,0.1,100);
                    }
                }

                mouseDrag(evt) {
                    this._inputVisitor.mouseDrag(this._root,evt);
                    this.postRedisplay();
                }
                
                mouseWheel(evt) {
                    this._inputVisitor.mouseWheel(this._root,evt);
                    this.postRedisplay();
                }
                
                touchMove(evt) {
                    this._inputVisitor.touchMove(this._root,evt);
                    this.postRedisplay();
                }
                
                mouseDown(evt) { this._inputVisitor.mouseDown(this._root,evt); }
                touchStar(evt) { this._inputVisitor.touchStar(this._root,evt); }
                mouseUp(evt) { this._inputVisitor.mouseUp(this._root,evt); }
                mouseMove(evt) { this._inputVisitor.mouseMove(this._root,evt); }
                mouseOut(evt) { this._inputVisitor.mouseOut(this._root,evt); }
                touchEnd(evt) { this._inputVisitor.touchEnd(this._root,evt); }
            }

            paella.WebGLCanvas = WebGLCanvas;
        }

        return paella.WebGLCanvas;
    }

    let g_canvasCallbacks = {};

    paella.addCanvasPlugin = function(canvasType, webglSupport, mouseEventsSupport, canvasPluginCallback) {
        g_canvasCallbacks[canvasType] = {
            callback: canvasPluginCallback,
            webglSupport: webglSupport,
            mouseEventsSupport: mouseEventsSupport
        };
    }

    function loadWebGLDeps() {
        return new Promise((resolve) => {
            if (!window.$paella_bg) {
                paella.require(`${ paella.baseUrl }javascript/bg2e-es2015.js`)
                    .then(() => {
                        window.$paella_bg = bg;
                        buildVideoCanvas();
                       // loadWebGLDeps();
                        resolve(window.$paella_bg);
                    })
            }
            else {
                resolve(window.$paella_bg);
            }
        });
    }

    function loadCanvasPlugin(canvasType) {
        return new Promise((resolve,reject) => {
            let callbackData = g_canvasCallbacks[canvasType];
            if (callbackData) {
                (callbackData.webglSupport ? loadWebGLDeps() : Promise.resolve())
                    .then(() => {
                        resolve(callbackData.callback());
                    })

                    .catch((err) => {
                        reject(err);
                    });
            }
            else {
                reject(new Error(`No such canvas type: "${canvasType}"`));
            }
        });
    }

    paella.getVideoCanvas = function(type) {
        return new Promise((resolve,reject) => {
            let canvasData = g_canvasCallbacks[type];
            if (!canvasData) {
                reject(new Error("No such canvas type: " + type));
            }
            else {
                if (canvasData.webglSupport) {
                    loadWebGLDeps()
                        .then(() => {
                            resolve(canvasData.callback());
                        });
                }
                else {
                    resolve(canvasData.callback());
                }
            }
        })
    }

    paella.getVideoCanvasData = function(type) {
        return g_canvasCallbacks[type];
    }

    // Standard <video> canvas
    paella.addCanvasPlugin("video", false, false, () => {
        return class VideoCanvas extends paella.VideoCanvas {
            constructor(stream) {
                super(stream);
            }

            loadVideo(videoPlugin,stream,doLoadCallback = null) {
                return new Promise((resolve,reject) => {
                    doLoadCallback = doLoadCallback || function(video) {
                        return new Promise((cbResolve,cbReject) => {
                            var sourceElem = video.querySelector('source');
                            if (!sourceElem) {
                                sourceElem = document.createElement('source');
                                video.appendChild(sourceElem);
                            }
                            if (video._posterFrame) {
                                video.setAttribute("poster",video._posterFrame);
                            }
                
                            sourceElem.src = stream.src;
                            sourceElem.type = stream.type;
                            video.load();
                            video.playbackRate = videoPlugin._playbackRate || 1;
                            cbResolve();
                        })
                    };

                    doLoadCallback(videoPlugin.video)
                        .then(() => {
                            resolve(stream);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            }
        }
    });
    
})();
