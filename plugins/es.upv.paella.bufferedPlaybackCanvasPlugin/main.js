
paella.addPlugin(() => {
    return class BufferedPlaybackCanvasPlugin extends paella.PlaybackCanvasPlugin {
        getName() { return "es.upv.paella.BufferedPlaybackCanvasPlugin"; }

        setup() {

        }

        drawCanvas(context,width,height,videoData) {
            function trimmedInstant(t) {
                t = videoData.trimming.enabled ? t - videoData.trimming.start : t;
                return t * width / videoData.trimming.duration;
            }

            let buffered = paella.player.videoContainer.streamProvider.buffered; 
            for (let i = 0; i<buffered.length; ++i) {
                let start = trimmedInstant(buffered.start(i));
                let end = trimmedInstant(buffered.end(i));
                this.drawBuffer(context,start,end,height);
            }
        }

        drawBuffer(context,start,end,height) {
            context[0].fillStyle = this.config.color;
            context[0].fillRect(start, 0, end, height);
        }
    }
})