
paella.addDataDelegate("cameraTrack",() => {
    return class TrackCameraDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) {
            let videoUrl = paella.player.videoLoader.getVideoUrl();
            if (videoUrl) {
                videoUrl += 'trackhd.json';
                paella.utils.ajax.get({ url:videoUrl },
                    (data) => {
                        if (typeof(data)==="string") {
                            try {
                                data = JSON.parse(data);
                            }
                            catch(err) {}
                        }
                        data.positions.sort((a,b) => {
                            return a.time-b.time;
                        });
                        onSuccess(data);
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


    function updatePosition(positionData,nextFrameData) {
        let twinTime = nextFrameData ? (nextFrameData.time - positionData.time) * 1000 : 100;
        if (twinTime>2000) twinTime = 2000;
        let rect = (positionData && positionData.rect) || [0, 0, 0, 0];
        let offset_x = Math.abs(rect[0]);
        let offset_y = Math.abs(rect[1]);
        let view_width = rect[2];
        let view_height = rect[3];
        let zoom = this._videoData.originalWidth / view_width;
        let left = offset_x / this._videoData.originalWidth;
        let top = offset_y / this._videoData.originalHeight;
        paella.player.videoContainer.masterVideo().setZoom(zoom  * 100,left * zoom * 100, top * zoom * 100, twinTime);
    }

    function nextFrame(time) {
        let index = -1;
        time = Math.round(time);
        this._trackData.some((data,i) => {
            if (data.time>=time) {
                index = i;
            }
            return index!==-1;
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
        this._trackData.some((data, i, frames) => {
          if (frames[i+1]) {
            if (data.time <= time && frames[i+1].time > time) {
                return true;
            }
          } else {
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
        this._trackData.some((data,i, frames) => {
          if (data.time <= time) {
            if (frames[i+1]) {
              if (frames[i+1].time > time) {
                frameRect = data;
              }
            } else {
              frameRect = data;
            }
          }
          return frameRect!==null;
        });
        return frameRect;
    }


    paella.addPlugin(function() {
        return class Track4KPlugin extends paella.EventDrivenPlugin {
            constructor() {
                super();

                g_track4kPlugin = this;

                this._videoData = {};
                this._trackData = [];

                this._enabled = true;
            }

            checkEnabled(cb) {
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
                    cb(this._enabled);
                });
            }

            get enabled() { return this._enabled; }

            set enabled(e) {
                this._enabled = e;
                if (this._enabled) {
                  let thisClass = this;
                  paella.player.videoContainer.currentTime().then(function(time) {
                    thisClass.updateZoom(time);
                  });
                }
            }

            getName() { return "es.upv.paella.track4kPlugin"; }
            getEvents() {
                return [ paella.events.timeupdate, paella.events.play, paella.events.seekToTime ];
            }
            onEvent(eventType,data) {
                if (!this._trackData.length) return;
                if (eventType===paella.events.play) {
                }
                else if (eventType===paella.events.timeupdate) {
                    this.updateZoom(data.currentTime);
                }
                else if (eventType===paella.events.seekToTime) {
                    this.seekTo(data.newPosition);
                }
            }

            updateZoom(currentTime) {
              if (this._enabled) {
                let data = curFrame.apply(this,[currentTime]);
                let nextFrameData = nextFrame.apply(this,[currentTime]);
                if (data && this._lastPosition!==data) {
                    this._lastPosition = data;
                    updatePosition.apply(this,[data,nextFrameData]);
                }
              }
            }

            seekTo(time) {
                let data = prevFrame.apply(this,[time]);
                if (data && this._enabled) {
                    this._lastPosition = data;
                    updatePosition.apply(this,[data]);
                }
            }

        };
    });

    paella.addPlugin(function() {

        return class VideoZoomTrack4KPlugin extends paella.ButtonPlugin {
            getAlignment() { return 'right'; }
            getSubclass() { return "videoZoomToolbar"; }
            getIconClass() { return 'icon-screen'; }
            closeOnMouseOut() { return true; }
            getIndex() { return 2030; }
            getName() { return "es.upv.paella.videoZoomTrack4kPlugin"; }
            getDefaultToolTip() { return paella.utils.dictionary.translate("Set video zoom"); }
            getButtonType() { return paella.ButtonPlugin.type.popUpButton; }

            checkEnabled(onSuccess) {
                let players = paella.player.videoContainer.streamProvider.videoPlayers;
                let pluginData = paella.player.config.plugins.list[this.getName()];
                let playerIndex = pluginData.targetStreamIndex;
                let autoByDefault = pluginData.autoModeByDefault;
                this.targetPlayer = players.length>playerIndex ? players[playerIndex] : null;
                g_track4kPlugin.enabled = autoByDefault;
                onSuccess(paella.player.config.player.videoZoom.enabled &&
                            this.targetPlayer &&
                            this.targetPlayer.allowZoom());
            }

            setup() {
                if (this.config.autoModeByDefault) {
                    this.zoomAuto()
                }
                else {
                    this.resetZoom()
                }
            }

            buildContent(domElement) {
                this.changeIconClass("icon-mini-zoom-in");
                g_track4kPlugin.updateTrackingStatus = () => {
                    if (g_track4kPlugin.enabled) {
                      $('.zoom-auto').addClass("autoTrackingActivated");
                      $('.icon-mini-zoom-in').addClass("autoTrackingActivated");
                    } else {
                      $('.zoom-auto').removeClass("autoTrackingActivated");
                      $('.icon-mini-zoom-in').removeClass("autoTrackingActivated");
                    }
                };
                paella.events.bind(paella.events.videoZoomChanged, (evt,target) => {
                    g_track4kPlugin.updateTrackingStatus;
                });
                g_track4kPlugin.updateTrackingStatus;

                function getZoomButton(className,onClick,content) {
                    let btn = document.createElement('div');
                    btn.className = `videoZoomToolbarItem ${ className }`;
                    if (content) {
                        btn.innerText = content;
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
                domElement.appendChild(getZoomButton('picture',(evt) => {
                    this.resetZoom();
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

            resetZoom() {
              g_track4kPlugin.enabled = false;
              this.targetPlayer.setZoom(100,0,0,500);
              if (g_track4kPlugin.updateTrackingStatus) g_track4kPlugin.updateTrackingStatus();
            }

            zoomAuto() {
              g_track4kPlugin.enabled = ! g_track4kPlugin.enabled;
              if (g_track4kPlugin.updateTrackingStatus) g_track4kPlugin.updateTrackingStatus();
            }
        };
    });
})();


