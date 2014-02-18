paella.editor.Editor = Class.create({
	config:null,
	editorContainer:null,
	isLoaded:false,
	bottomBar:null,
	rightBar:null,
	embedPlayer:null,
	loader:null,

	initialize:function() {
		if (paella.player.accessControl.permissions.canWrite) {
			var thisClass = this;
			paella.editor.instance = this;
			paella.initDelegate.loadEditorConfig(function(config) {
				thisClass.config = config;
				thisClass.loadEditor();
			});	
		}
	},
	
	loadEditor:function() {
		paella.keyManager.enabled = false;
		var thisClass = this;
		this.editorContainer = document.createElement('div');
		$('body')[0].appendChild(this.editorContainer);
		this.editorContainer.className = 'editorContainer';
		this.editorContainer.id = "editorContainer";
		this.editorContainer.appendChild(paella.player.mainContainer);
		$('body')[0].style.backgroundImage = "url(resources/images/editor_video_bkg.png)";
		
		this.loader = new paella.AsyncLoader();
		this.bottomBar = this.loader.addCallback(new paella.editor.BottomBar());
		this.rightBar = this.loader.addCallback(new paella.editor.RightBar());
		this.embedPlayer = this.loader.addCallback(new paella.editor.EmbedPlayer());
		this.loader.load(function() {
			thisClass.onLoadSuccess();
		},function() {
			thisClass.onLoadFail();
		});
	},
	
	onLoadSuccess:function() {
		this.isLoaded = true;
		var thisClass = this;
		this.onresize();
		$(window).resize(function(event) {
			thisClass.onresize();
		});
		$(document).trigger(paella.events.play);
		new Timer(function(timer) {
			$(document).trigger(paella.events.pause);	
		},100);
		paella.events.bind(paella.events.documentChanged,function(event,params) {
			window.onbeforeunload = function(event) { return paella.dictionary.translate('There are unsaved changes'); }
		});
		paella.events.bind(paella.events.didSaveChanges,function(event,params) {
			window.onbeforeunload = null;
		});
	},
	
	onLoadFail:function() {
		
	},
	
	unloadEditor:function() {
		paella.keyManager.enabled = true;
		this.embedPlayer.restorePlayer();
		$('body')[0].removeChild(this.editorContainer);
		$('body')[0].style.backgroundImage = "";
		this.editorContainer = null;
		this.isLoaded = false;
		$(document).trigger(paella.events.pause);		
		$(document).trigger(paella.events.hideEditor);			
	},

	onresize:function() {
		if (this.isLoaded) {
			this.bottomBar.onresize();
			this.rightBar.onresize();
			this.embedPlayer.onresize();
		}
	}
});

/*
var EditControl = Class.create(paella.DomNode,{
	buttonId:'',

	initialize:function(id) {
		this.buttonId = id + '_button';
		var style = {position:'absolute',top:'0px',right:'0px'};
		this.parent('div',id,style);
		this.domElement.className = 'editControlContainer';
		var editButton = this;
		this.addNode(new paella.Button(this.buttonId,'editButton',function(event) {
			editButton.toggleEditor();
		},false));
	},

	toggleEditor:function() {
		if ((paella.extended) || (window!=window.top)){
			window.open("index.html?id=" + paella.player.videoIdentifier);
		}
		else{
			$(document).trigger(paella.events.showEditor);
		}
	},

	getButton:function() {
		return this.getNode(this.buttonId);
	}
});
*/

