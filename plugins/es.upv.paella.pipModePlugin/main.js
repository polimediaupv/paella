Class ("paella.plugins.PIPModePlugin", paella.ButtonPlugin, {
	getIndex:function() { return 551; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "PIPModeButton"; },
	getName:function() { return "es.upv.paella.pipModePlugin"; },
	checkEnabled:function(onSuccess) {
        var mainVideo = paella.player.videoContainer.masterVideo();
        var video = mainVideo.video;
        if (video && video.webkitSetPresentationMode) {
            onSuccess(true);
        }
        else {
            onSuccess(false);
        }
	},
	getDefaultToolTip:function() { return base.dictionary.translate("Set picture-in-picture mode."); },

	setup:function() {
		
	},

	action:function(button) {
		var video = paella.player.videoContainer.masterVideo().video;
        if (video.webkitPresentationMode=="picture-in-picture") {
            video.webkitSetPresentationMode("inline");
        }
        else {
            video.webkitSetPresentationMode("picture-in-picture");
        }
	}
});

paella.plugins.pipModePlugin = new paella.plugins.PIPModePlugin();
