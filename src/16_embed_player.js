paella.editor.EmbedPlayer = Class.create(paella.AsyncLoaderCallback,{
	editar:null,
	
	initialize:function() {
		this.editor = paella.editor.instance;
	},
	
	load:function(onSuccess,onError) {
		var barHeight = this.editor.bottomBar.getHeight() + 20;
		var rightBarWidth = this.editor.rightBar.getWidth() + 20;
		$(paella.player.mainContainer).css({
			'position':'fixed',
			"width":"",
			"bottom":barHeight + "px",
			"right":rightBarWidth + "px",
			"left":"20px",
			"top":"20px"
		});
		paella.player.mainContainer.className = "paellaMainContainerEditorMode";
		new Timer(function(timer) {
			paella.player.controls.disable();
			paella.player.onresize();
			if (onSuccess) {
				onSuccess();
			}
		},500);
	},
	
	restorePlayer:function() {
		$('body')[0].appendChild(paella.player.mainContainer);
		paella.player.controls.enable();
		paella.player.mainContainer.className = "";
		$(paella.player.mainContainer).css({
			'position':'',
			"width":"",
			"bottom":"",
			"left":"",
			"right":"",
			"top":""
		});
		paella.player.onresize();
	},
	
	onresize:function() {
		var barHeight = this.editor.bottomBar.getHeight() + 20;
		var rightBarWidth = this.editor.rightBar.getWidth() + 20;
		$(paella.player.mainContainer).css({
			'position':'fixed',
			"width":"",
			"bottom":barHeight + "px",
			"right":rightBarWidth + "px",
			"left":"20px",
			"top":"20px"
		});

	}
});