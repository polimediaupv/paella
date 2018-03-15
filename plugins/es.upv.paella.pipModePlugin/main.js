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
            if (video && video.webkitSetPresentationMode) {
                onSuccess(true);
            }
            else {
                onSuccess(false);
            }
        }
        getDefaultToolTip() { return base.dictionary.translate("Set picture-in-picture mode."); }

        setup() {
            
        }

        action(button) {
            var video = paella.player.videoContainer.masterVideo().video;
            if (video.webkitPresentationMode=="picture-in-picture") {
                video.webkitSetPresentationMode("inline");
            }
            else {
                video.webkitSetPresentationMode("picture-in-picture");
            }
        }
    }
});