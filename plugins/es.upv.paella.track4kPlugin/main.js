paella.addPlugin(function() {


    class TrackCameraDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) {
            let url = paella.player.videoLoader._url + 'trackhd.json';
            paella.utils.ajax.get({ url:url },
                (data) => onSuccess(JSON.parse(data)),
                () => onSuccess(null) );
        }
    
        write(context,params,value,onSuccess) {
        }
    
        remove(context,params,onSuccess) {
        }
    }

    paella.dataDelegates.TrackCameraDataDelegate = TrackCameraDataDelegate;

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
                console.log("Hola");
            }
        }
    }
});

