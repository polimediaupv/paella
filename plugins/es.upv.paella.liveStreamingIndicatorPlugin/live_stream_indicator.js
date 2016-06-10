Class ("paella.LiveStreamIndicator",paella.VideoOverlayButtonPlugin,{
    isEditorVisible:function() {
        return paella.editor.instance!=null;
    },
    getIndex:function() {return 10;},

    getSubclass:function() {
        return "liveIndicator";
    },

    getAlignment:function() {
        return 'right';
    },
    getDefaultToolTip:function() { return base.dictionary.translate("This video is a live stream"); },

    checkEnabled:function(onSuccess) {
        onSuccess(paella.player.isLiveStream());
    },

    setup:function() {
        var thisClass = this;
    },

    action:function(button) {
        paella.messageBox.showMessage(base.dictionary.translate("Live streaming mode: This is a live video, so, some capabilities of the player are disabled"));
    },

    getName:function() {
        return "es.upv.paella.liveStreamingIndicatorPlugin";
    }
});

paella.plugins.liveStreamIndicator = new paella.LiveStreamIndicator();
