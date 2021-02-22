import "regenerator-runtime/runtime";
import {
    defaultLoadConfigFunction,
    defaultGetVideoIdFunction,
    defaultGetManifestUrlFunction,
    defaultGetManifestFileUrlFunction,
    defaultLoadVideoManifestFunction
} from 'paella/js/core/initFunctions';
import { resolveResourcePath, setupAutoHideUiTimer } from 'paella/js/core/utils';
import { createElement } from 'paella/js/core/dom';
import { registerPlugins } from 'paella/js/core/Plugin';
import VideoContainer from 'paella/js/core/VideoContainer';
import PreviewContainer from 'paella/js/core/PreviewContainer';
import PlaybackBar from 'paella/js/core/PlaybackBar';
import Events, { bindEvent } from 'paella/js/core/Events';


import "paella/styles/base.css";

export default class Paella {
    constructor(containerElement, initParams = {}) {
        // Debug: create an array of all paella player instances
        window.__paella_instances__ = window.__paella_instances__ || [];
        window.__paella_instances__.push(this);

        console.debug("New paella player instance");
        
        if (typeof(containerElement) === "string") {
            containerElement = document.getElementById(containerElement);
        }
        
        containerElement.classList.add("player-container");
        
        this._containerElement = containerElement;
        this._initParams = initParams;
        
        // Default initParams values:
        this._initParams.manifestFileName = this._initParams.manifestFileName || "data.json";
        this._initParams.loadConfig = this._initParams.loadConfig || defaultLoadConfigFunction;
        this._initParams.getVideoId = this._initParams.getVideoId || defaultGetVideoIdFunction;
        this._initParams.getManifestUrl = this._initParams.getManifestUrl || defaultGetManifestUrlFunction;
        this._initParams.getManifestFileUrl = this._initParams.getManifestFileUrl || defaultGetManifestFileUrlFunction;
        this._initParams.loadVideoManifest = this._initParams.loadVideoManifest || defaultLoadVideoManifestFunction;
        this._initParams.customPluginContext = this._initParams.customPluginContext || [];

        this._config = null;
        this._videoId = null;
        this._manifestUrl = null;
        this._manifestFileUrl = null;
        this._manifestData = null;
        this._videoManifest = null;

        // Load status flags
        this._playerLoaded = false;

        const resize = () => {
            this.resize();
        }
        window.addEventListener("resize", resize);
    }

    
    get hideUiTime() {
        return this._hideUiTime;
    }

    set hideUiTime(val) {
        this._hideUiTime = val;
    }
    
    get containerSize() { return { w: this._containerElement.offsetWidth, h: this._containerElement.offsetHeight }; }
    
    get containerElement() { return this._containerElement; }

    get initParams() { return this._initParams; }

    // Status flags getters
    // The configuration is loaded
    get configLoaded() {
        return this.configUrl !== null;
    }

    // The video manifest file is loaded
    get videoManifestLoaded() {
        return this.videoManifest !== null;
    }

    // The video streams are loaded
    get videoLoaded() {
        return this.videoContainer?.ready || false;
    }

    // The player user interface is loaded
    get playerLoaded() {
        return this._playerLoaded;
    }

    get configUrl() {
        return this._initParams?.configUrl || 'config/config.json';
    }

    get config() {
        return this._config;
    }

    get videoId() {
        return this._videoId;
    }

    // Base URL where the video repository is located, for example "repository/"
    get repositoryUrl() {
        return this._initParams?.repositoryUrl || this.config?.repositoryUrl || "";
    }

    // Base URL where the video manifest file is located, for example "repository/[video_id]"
    get manifestUrl() {
        return this._manifestUrl;
    }

    // Video manifest file name, for example "data.json"
    get manifestFileName() {
        return this.config?.manifestFileName || this._initParams?.manifestFileName || "";
    }

    // Full path of the video manifest, for example "repository/[video_id]/data.json"
    get manifestFileUrl() {
        return this._manifestFileUrl;
    }

    // Video manifest file content (data.json)
    get videoManifest() {
        return this._videoManifest;
    }

    get previewContainer() {
        return this._previewContainer;
    }

    get videoContainer() {
        return this._videoContainer;
    }

    get playbackBar() {
        return this._playbackBar;
    }
    
    async loadManifest() {
        console.debug("Loading paella player");
        this._config = await this.initParams.loadConfig(this.configUrl);

        registerPlugins(this);

        this._videoId = await this.initParams.getVideoId();

        this._manifestUrl = await this.initParams.getManifestUrl(this.repositoryUrl,this.videoId);
        
        this._manifestFileUrl = await this.initParams.getManifestFileUrl(this._manifestUrl, this.manifestFileName);

        console.debug(`Loading video with identifier '${this.videoId}' from URL '${this.manifestFileUrl}'`);

        this._videoManifest = await this.initParams.loadVideoManifest(this.manifestFileUrl);

        console.debug("Video manifest loaded:");
        console.debug(this.videoManifest);

        // The video preview is required to use the lazy load
        if (!this.videoManifest?.metadata?.preview) {
            await this.loadPlayer();
        }
        else {
            
            const preview = resolveResourcePath(this, this.videoManifest?.metadata?.preview);
            this._previewContainer = new PreviewContainer(this, this._containerElement, preview);
        }

        
        // TODO load the "preload" type plugins
    }

    async loadPlayer() {
        // TODO: add two ready flags, one for lazy load and another for full load
        this._videoContainer = new VideoContainer(this, this._containerElement);
        
        await this.videoContainer.load(this.videoManifest?.streams);

        
        this._playbackBar = new PlaybackBar(this, this.containerElement);

        this._previewContainer?.removeFromParent();
        
        await this._playbackBar.load();
        
        // UI hide timer
        this._hideUiTime = 5000;
        setupAutoHideUiTimer(this);
        
        // TODO: this._playerLoaded = true;  the player user interface is loaded
    }

    async load() {
        await this.loadManifest();
        await this.loadPlayer();
    }

    async resize() {
        this.videoContainer?.updateLayout();
        this.playbackBar?.onResize();
    }
    
    async hideUserInterface() {
        if (!(await this.videoContainer?.paused())) {
            this.videoContainer?.hideUserInterface();
            this.playbackBar?.hideUserInterface();
        }
    }
    
    async showUserInterface() {
        this.videoContainer?.showUserInterface();
        this.playbackBar?.showUserInterface();
    }

    // Playback functions
    async play() {
        if (!this.videoContainer) {
            await this.loadPlayer();
        }

        await this.videoContainer.play();
    }

    async pause() {
        await this.videoContainer?.play();
    }

    async stop() {
        await this.videoContainer?.stop();
    }

}
