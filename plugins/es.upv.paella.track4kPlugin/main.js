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

paella.addPlugin(function() {
    return class Track4KPlugin extends paella.EventDrivenPlugin {
        constructor() {
            super();
            this._videoData = {}
            this._trackData = {};
            paella.data.read('cameraTrack',{id:paella.initDelegate.getId()},(data) => {
                this._videoData.width = data.width;
                this._videoData.height = data.height;
                this._trackData = data.positions;
            });
        }

        getName() { return "es.upv.paella.track4kPlugin"; }
        getEvents() {
            return [ paella.events.timeupdate, paella.events.play ]
        }
        onEvent(eventType) {
            if (eventType==paella.events.play) {
            }
            else if (eventType==paella.events.timeupdate) {
                //console.log("timeupdate");
            }
        }
    }
});

