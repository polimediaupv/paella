
paella.addPlugin(function() {
    return class LiveStreamIndicator extends paella.VideoOverlayButtonPlugin {
        isEditorVisible() { return paella.editor.instance!=null; }
        getIndex() {return 10;}
        getSubclass() { return "liveIndicator"; }
        getAlignment() { return 'right'; }
        getDefaultToolTip() { return paella.utils.dictionary.translate("This video is a live stream"); }
        getName() { return "es.upv.paella.liveStreamingIndicatorPlugin"; }

        checkEnabled(onSuccess) {
            onSuccess(paella.player.isLiveStream());
        }

        setup() {}

        action(button) {
            paella.messageBox.showMessage(paella.utils.dictionary.translate("Live streaming mode: This is a live video, so, some capabilities of the player are disabled"));
        }
    }
});