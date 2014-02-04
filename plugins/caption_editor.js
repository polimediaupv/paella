paella.plugins.CaptionsEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:null,
	selectedTrackItem:null,
	
	checkEnabled:function(onSuccess) {
		var This = this;
		this.tracks = [];
		paella.data.read('captions',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.captions && data.captions.length>0) {
				This.tracks = data.captions;
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Captions':'Subtítulos',
				'Caption':'Subtítulo',
				'Create a new caption in the current position': 'Añade un subtítulo en el instante actual',
				'Delete selected caption': 'Borra el subtítulo seleccionado'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new caption in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected caption')}
		];
	},
	
	onToolSelected:function(toolName) {
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			paella.events.trigger(paella.events.documentChanged);
			this.tracks.splice(this.tracks.indexOf(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			paella.events.trigger(paella.events.documentChanged);
			var start = paella.player.videoContainer.currentTime();
			var end = start + 30;
			var id = this.getTrackUniqueId();
			var content = paella.dictionary.translate('Caption');
			this.tracks.push({id:id,s:start,e:end,content:content,name:content});
			return true;
		}
	},
	
	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},
	
	getName:function() {
		return "es.upv.paella.editor.trackCaptions";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Captions");
	},
	
	getColor:function() {
		return 'rgb(159, 166, 88)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.s = start;
			item.e = end;
			this.selectedTrackItem = item;
		}
	},
	
	onTrackContentChanged:function(id,content) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.content = paella.AntiXSS.htmlEscape(content);
			item.name = paella.AntiXSS.htmlEscape(content);
		}
	},
	
	allowEditContent:function() {
		return true;
	},
	
	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},
	
	contextHelpString:function() {
		if (paella.utils.language()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar subtítulos. Para crear un subtítulo, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los subtítulos";
		}
		else {
			return "Use this tool to create, delete and edit video captions. To create a caption, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the caption text.";
		}
	},
	
	onSave:function(success) {
		var data = {
			captions:[]
		}
		for (var i = 0; i<this.tracks.length; ++i) {
			var track = this.tracks[i];
			var trackParams = {}
			for (var key in track) {
				// Avoid write the DOM element
				if (key!='elem') {
					trackParams[key] = track[key];
				}
			}
			data.captions.push(trackParams);
		}
		paella.data.write('captions',{id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.captionsPlayerlugin.captions = data.captions;
			success(status);
		});

		if (data.captions.length >= 1) paella.plugins.activeCaptionsPlugin.setButtonEnabled(true);
      	else paella.plugins.activeCaptionsPlugin.setButtonEnabled(false);
	}
});

paella.plugins.captionsEditorPlugin = new paella.plugins.CaptionsEditorPlugin();


paella.plugins.CaptionsPlayerPlugin = Class.create(paella.EventDrivenPlugin,{
	captions:null,
	lastEvent:0,
	visibleCaptions:[],
	captionsEnabled:null,
	root: null,
	element:null,
	counter: 0,

	getName:function() { return "es.upv.paella.CaptionsPlayerPlugin"; },
	checkEnabled:function(onSuccess) {
		var This = this;
		this.captions = [];
		this.visibleCaptions = [];
		paella.data.read('captions',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.captions && data.captions.length>0) {
				This.captions = data.captions;
			}
			onSuccess(true);
		});
	},

	setup:function() {

		var overlayContainer = paella.player.videoContainer.overlayContainer;
		var rect = {left:100,top:620,width:1080,height:20};

		this.root = document.createElement("div");
		this.root.className = 'videoLoadTestOverlay';
			
		this.element = document.createElement("div");
		this.element.className = 'textCaption';

		this.root.appendChild(this.element);

		//overlayContainer.addElement(this.root, rect);

	},
		
	getEvents:function() { return [paella.events.timeUpdate]; },

	onEvent:function(eventType,params) {
		this.checkCaptions(params);
	},
	
	checkCaptions:function(params) {
		for (var i=0; i<this.captions.length; ++i) {
			var a = this.captions[i];
			if (this.captionsEnabled && a.s<params.currentTime && a.e>params.currentTime) {
				this.showCaption(a);
			}
		}
		
		for (var key in this.visibleCaptions) {
			if (typeof(a)=='object') {
				var a = this.visibleCaptions[key];
				if (a && (a.s>=params.currentTime || a.e<=params.currentTime || !this.captionsEnabled)) {
					this.removeCaption(a);
				}
			}
		}

		if (this.counter <= 0) {
			this.element.innerHTML = '';
			this.element.className = 'textCaption disabled';
		}
	},
	
	showCaption:function(caption) {
		this.element.className = 'textCaption';
		this.element.innerHTML = caption.content;
			
		if (!this.visibleCaptions[caption.s]) {

			var overlayContainer = paella.player.videoContainer.overlayContainer;
			var rect = {left:100,top:620,width:1080,height:20};
			overlayContainer.addElement(this.root, rect);
			this.counter++;
			this.visibleCaptions[caption.s] = caption;
			
			/*var rect = {left:100,top:620,width:1080,height:20};
			caption.elem = paella.player.videoContainer.overlayContainer.addText(caption.content,rect);
			caption.elem.className = 'textCaption';
			this.visibleCaptions[caption.s] = caption;*/
		}
	},
	
	removeCaption:function(caption) {
		if (this.visibleCaptions[caption.s]) {
			this.counter--;
			this.visibleCaptions[caption.s] = null;

			/*var elem = this.visibleCaptions[caption.s].elem;
			paella.player.videoContainer.overlayContainer.removeElement(elem);
			this.visibleCaptions[caption.s] = null;*/
		}
	}
});

paella.plugins.captionsPlayerlugin = new paella.plugins.CaptionsPlayerPlugin();

paella.plugins.ActiveCaptionsPlugin = Class.create(paella.ButtonPlugin,{
	button: null,
	buttonEnabled: true,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showCaptionsPluginButton"; },
	getIndex:function() { return 580; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.activeCaptionsPlugin"; },
	checkEnabled:function(onSuccess) { 
		var thisClass = this;
		paella.data.read('captions',{id:paella.initDelegate.getId()},function(data,status) {
		 	if (!(data && typeof(data)=='object' && data.captions && data.captions.length>0)) {
				thisClass.button.className = thisClass.getButtonItemClass(false,false);
				thisClass.buttonEnabled = false;
		 	}
		 	onSuccess(true); 
		});
	},
	getDefaultToolTip:function() { return paella.dictionary.translate("Show captions"); },

	setup:function(){
		if(this.buttonEnabled) this.showButton();
		else this.hideButton();
	},	
						  
	action:function(button) {
		this.button = button;
		if (this.activeCaptions) {
			button.className = this.getButtonItemClass(false,true);
			paella.plugins.captionsPlayerlugin.captionsEnabled = false;
			this.activeCaptions = false;
		} else { 
			button.className = this.getButtonItemClass(true,true);
			paella.plugins.captionsPlayerlugin.captionsEnabled = true;
			this.activeCaptions = true;
		}
	},

	setButtonEnabled:function(enabled){
		var sel = this.button.className.split(" ");
		this.activeCaptions = ((enabled)&&(sel[3] == 'selected'));
		this.button.className = this.getButtonItemClass(sel[3] == 'selected',enabled);
		if (enabled) this.showButton();
		else this.hideButton();
		paella.plugins.captionsPlayerlugin.captionsEnabled = ((enabled)&&(sel[3] == 'selected'));
	},
	
	getButtonItemClass:function(selected,enabled) {
		return 'buttonPlugin '+this.getAlignment() +' '+ this.getSubclass() + ((selected) ? ' selected':'') + ((enabled) ? '':' disabled');
	}
});
  

paella.plugins.activeCaptionsPlugin = new paella.plugins.ActiveCaptionsPlugin();
