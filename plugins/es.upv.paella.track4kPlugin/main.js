paella.addDataDelegate("cameraTrack",() => {
    return class TrackCameraDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) {
            let videoUrl = paella.player.videoLoader.getVideoUrl();
            if (videoUrl) {
                videoUrl += 'trackhd.json';
                paella.utils.ajax.get({ url:videoUrl },
                    (data) => {
                        if (typeof(data)=="string") {
                            try {
                                data = JSON.parse(data);
                            }
                            catch(err) {}
                        }
                        data.positions.sort((a,b) => {
                            return a.time-b.time;
                        })
                        onSuccess(data)
                    },
                    () => onSuccess(null) );
            }
            else {
                onSuccess(null);
            }
        }
    
        write(context,params,value,onSuccess) {
        }
    
        remove(context,params,onSuccess) {
        }
    };
});

(() => {
    // Used to connect the toolbar button with the track4k plugin
    let g_track4kPlugin = null;
    
    
    function updatePosition(positionData) {
        let zoom = this._videoData.originalWidth / this._videoData.width;
        let left = positionData[0] / this._videoData.originalWidth;
        let top = (positionData[1] + this._videoData.originalHeight / 2) / this._videoData.originalHeight; 
        paella.player.videoContainer.masterVideo().setZoom(zoom  * 100,left * zoom * 100,(top * zoom - 1) * 100, 1000);
    }

    function nextFrame(time) {
        let index = -1;
        time = Math.round(time);
        this._trackData.some((data,i) => {
            if (data.time>=time) {
                index = i;
            }
            return index!=-1;
        });
        // Index contains the current frame index
        if (this._trackData.length>index+1) {
            return this._trackData[index+1];
        }
        else {
            return null;
        }
    }

    function prevFrame(time) {
        let frame = this._trackData[0];
        time = Math.round(time);
        this._trackData.some((data,i) => {
            if (data.time==time) {
                return true;
            }
            frame = data;
            return false;
        });
        return frame;
    }

    function curFrame(time) {
        let frameRect = null;
        time = Math.round(time);
        this._trackData.some((data,index) => {
            if (data.time==time) {
                frameRect = data.rect;
            }
            return frameRect!=null;
        });
        return frameRect;
    }
    

    paella.addPlugin(function() {
        return class Track4KPlugin extends paella.EventDrivenPlugin {
            constructor() {
                super();

                g_track4kPlugin = this;

                this._videoData = {}
                this._trackData = {};
                paella.data.read('cameraTrack',{id:paella.initDelegate.getId()},(data) => {
                    if (data) {
                        this._videoData.width = data.width;
                        this._videoData.height = data.height;
                        this._videoData.originalWidth = data.originalWidth;
                        this._videoData.originalHeight = data.originalHeight;
                        this._trackData = data.positions;
                        this._enabled = true;
                    }
                    else {
                        this._enabled = false;
                    }
                });

                this._enabled = true;
            }

            get enabled() { return this._enabled; }

            set enabled(e) {
                this._enabled = e;
                if (this._enabled) {
                    updatePosition.apply(this,[this._lastPosition]);
                }
            }
    
            getName() { return "es.upv.paella.track4kPlugin"; }
            getEvents() {
                return [ paella.events.timeupdate, paella.events.play, paella.events.seekToTime ]
            }
            onEvent(eventType,data) {
                if (eventType==paella.events.play) {
                }
                else if (eventType==paella.events.timeupdate) {
                    this.updateZoom(data.currentTime);    
                }
                else if (eventType==paella.events.seekToTime) {
                    this.seekTo(data.newPosition);
                }
            }
    
            updateZoom(currentTime) {
                let data = curFrame.apply(this,[currentTime]);
                if (data && this._lastPosition!=data && this._enabled) {
                    this._lastPosition = data;
                    updatePosition.apply(this,[data]);
                }
            }

            seekTo(time) {
                let data = prevFrame.apply(this,[time]);
                if (data && this._enabled) {
                    this._lastPosition = data;
                    updatePosition.apply(this,[data]);
                }
            }

        }
    });
    
    paella.addPlugin(function() {
        
        return class VideoZoomTrack4KPlugin extends paella.ButtonPlugin {
            getAlignment() { return 'right'; }
            getSubclass() { return "videoZoomToolbar"; }
            getIconClass() { return 'icon-screen'; }
            closeOnMouseOut() { return true; }
            getIndex() { return 2030; }
            getMinWindowSize() { return (paella.player.config.player &&
                                        paella.player.config.player.videoZoom &&
                                        paella.player.config.player.videoZoom.minWindowSize) || 600; }
            getName() { return "es.upv.paella.videoZoomTrack4kPlugin"; }
            getDefaultToolTip() { return base.dictionary.translate("Set video zoom"); }
            getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
    
            checkEnabled(onSuccess) {
                paella.player.videoContainer.videoPlayers()
                    .then((players) => {
                        let pluginData = paella.player.config.plugins.list[this.getName()];
                        let playerIndex = pluginData.targetStreamIndex;
                        this.targetPlayer = players.length>playerIndex ? players[playerIndex] : null;
                        onSuccess(paella.player.config.player.videoZoom.enabled &&
                                  this.targetPlayer &&
                                  this.targetPlayer.allowZoom());
                    });
            }
            
            buildContent(domElement) {
                paella.events.bind(paella.events.videoZoomChanged, (evt,target) => {
                    if (g_track4kPlugin.enabled) {
                        this.changeIconClass("icon-mini-videocamera");
                    }
                    else {
                        this.changeIconClass("icon-mini-zoom-in");
                    }
                });
        
                function getZoomButton(className,onClick,content) {
                    let btn = document.createElement('div');
                    btn.className = `videoZoomToolbarItem ${ className }`;
                    if (content) {
                        btn.innerHTML = content;
                    }
                    else {
                        btn.innerHTML = `<i class="glyphicon glyphicon-${ className }"></i>`;
                    }
                    $(btn).click(onClick);
                    return btn;
                }
                domElement.appendChild(getZoomButton('zoom-in',(evt) => {
                    this.zoomIn();
                }));
                domElement.appendChild(getZoomButton('zoom-out',(evt) => {
                    this.zoomOut();
                }));
                domElement.appendChild(getZoomButton('zoom-auto',(evt) => {
                    this.zoomAuto();
                    paella.player.controls.hidePopUp(this.getName());
                }, "auto"));
            }

            zoomIn() {
                g_track4kPlugin.enabled = false;
                this.targetPlayer.zoomIn();
            }

            zoomOut() {
                g_track4kPlugin.enabled = false;
                this.targetPlayer.zoomOut();
            }

            zoomAuto() {
                g_track4kPlugin.enabled = true;
            }
        }
    });
})();


