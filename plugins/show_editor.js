paella.ShowEditorPlugin = Class.create(paella.VideoOverlayButtonPlugin,{
	isEditorVisible:function() {
		return paella.editor.instance!=null;
	},

	getSubclass:function() {
		return "showEditorButton";
	},
	
	getAlignment:function() {
		return 'right';
	},
	
	checkEnabled:function(onSuccess) {
		onSuccess(paella.editor && paella.player.config.editor && paella.player.config.editor.enabled && !paella.utils.userAgent.browser.IsMobileVersion);
	},
	
	setup:function() {
		var thisClass = this;
		paella.events.bind(paella.events.hideEditor,function(event) { thisClass.onHideEditor(); });
		paella.events.bind(paella.events.showEditor,function(event) { thisClass.onShowEditor(); });
	},

	action:function(button) {
		if (!this.isEditorVisible()) {
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
		return "es.upv.paella.ShowEditorPlugin";
	}
});

paella.plugins.showEditorPlugin = new paella.ShowEditorPlugin();