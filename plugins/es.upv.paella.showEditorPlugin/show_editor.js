Class ("paella.ShowEditorPlugin",paella.VideoOverlayButtonPlugin,{
	isEditorVisible:function() {
		return paella.editor.instance!=null;
	},
	getIndex:function() {return 10;},

	getSubclass:function() {
		return "showEditorButton";
	},

	getAlignment:function() {
		return 'right';
	},
	getDefaultToolTip:function() { return base.dictionary.translate("Enter editor mode"); },

	checkEnabled:function(onSuccess) {
		onSuccess(paella.editor && paella.player.config.editor && paella.player.config.editor.enabled && !base.userAgent.browser.IsMobileVersion &&
			(paella.initDelegate.initParams.accessControl.permissions.canWrite || this.config.alwaysVisible) && !paella.player.isLiveStream());
	},

	setup:function() {
		var thisClass = this;

		paella.events.bind(paella.events.hideEditor,function(event) { thisClass.onHideEditor(); });
		paella.events.bind(paella.events.showEditor,function(event) { thisClass.onShowEditor(); });
	},

	action:function(button) {
		var editorPage = this.config.editorPage ? this.config.editorPage: '';
		var openEditorInIframe = this.config.openEditorInIframe ? this.config.openEditorInIframe: false;
		if (window!=window.top && !openEditorInIframe){
			window.open(editorPage + "?id=" + paella.player.videoIdentifier, '_top');
		}
		else {
			paella.events.trigger(paella.events.showEditor);
		}
	},

	onHideEditor:function() {
		this.showButton();
	},

	onShowEditor:function() {
		this.hideButton();
	},

	getName:function() {
		return "es.upv.paella.showEditorPlugin";
	}
});

paella.plugins.showEditorPlugin = new paella.ShowEditorPlugin();
