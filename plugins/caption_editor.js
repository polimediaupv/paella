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
			item.content = content;
			item.name = content;
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
			captions:this.tracks
		}
		paella.data.write('captions',{id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.captionsPlayerlugin.captions = data.captions;
			success(status);
		});
	}
});

paella.plugins.captionsEditorPlugin = new paella.plugins.CaptionsEditorPlugin();


paella.plugins.CaptionsPlayerPlugin = Class.create(paella.EventDrivenPlugin,{
	captions:null,
	lastEvent:0,
	
	visibleCaptions:null,

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
		
	getEvents:function() { return [paella.events.timeUpdate]; },

	onEvent:function(eventType,params) {
		this.checkCaptions(params);
	},
	
	checkCaptions:function(params) {
		for (var i=0; i<this.captions.length; ++i) {
			var a = this.captions[i];
			if (a.s<params.currentTime && a.e>params.currentTime) {
				this.showCaption(a);
			}
		}
		
		for (var key in this.visibleCaptions) {
			if (typeof(a)=='object') {
				var a = this.visibleCaptions[key];
				if (a && (a.s>=params.currentTime || a.e<=params.currentTime)) {
					this.removeCaption(a);
				}
			}
		}
	},
	
	showCaption:function(caption) {
		if (!this.visibleCaptions[caption.s]) {
			var rect = {left:100,top:650,width:1080,height:20};
			caption.elem = paella.player.videoContainer.overlayContainer.addText(caption.content,rect);
			caption.elem.className = 'textCaption';
			this.visibleCaptions[caption.s] = caption;
		}
	},
	
	removeCaption:function(caption) {
		if (this.visibleCaptions[caption.s]) {
			var elem = this.visibleCaptions[caption.s].elem;
			paella.player.videoContainer.overlayContainer.removeElement(elem);
			this.visibleCaptions[caption.s] = null;
		}
	}
});

paella.plugins.captionsPlayerlugin = new paella.plugins.CaptionsPlayerPlugin();
