paella.addPlugin(function() {
    return class PIPModePlugin extends paella.ButtonPlugin {
        getIndex() { return 551; }
        getAlignment() { return 'right'; }
        getSubclass() { return "PIPModeButton"; }
        getIconClass() { return 'icon-pip'; }
        getName() { return "es.upv.paella.pipModePlugin"; }
        checkEnabled(onSuccess) {
            var mainVideo = paella.player.videoContainer.masterVideo();
            var video = mainVideo.video;

            // PIP is only available with single stream videos
            if (paella.player.videoContainer.streamProvider.videoStreams.length!=1) {
                onSuccess(false);
            }
            else if (video && video.webkitSetPresentationMode) {
                onSuccess(true);
            }
            else if (video && 'pictureInPictureEnabled' in document) {
                onSuccess(true);
            }
            else {
                onSuccess(false);
            }
        }
        getDefaultToolTip() { return paella.utils.dictionary.translate("Set picture-in-picture mode."); }

        setup() {

        }

        action(button) {
            var video = paella.player.videoContainer.masterVideo().video;
            if (video.webkitSetPresentationMode) {
                if (video.webkitPresentationMode=="picture-in-picture") {
                    video.webkitSetPresentationMode("inline");
                }
                else {
                    video.webkitSetPresentationMode("picture-in-picture");
                }
            }
            else if ('pictureInPictureEnabled' in document) {
                if (video !== document.pictureInPictureElement) {
                    video.requestPictureInPicture();
                } else {
                    document.exitPictureInPicture();
                }
            }

        }
    }
});
