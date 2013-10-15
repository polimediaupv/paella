paella.plugins.AnnotationsEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:null,
	selectedTrackItem:null,
	
	checkEnabled:function(onSuccess) {
		var This = this;
		this.tracks = [];
		paella.data.read('annotations',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.annotations && data.annotations.length>0) {
				This.tracks = data.annotations;
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Annotation':'Anotación',
				'Annotations':'Anotaciones'
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
			var content = paella.dictionary.translate('Annotation');
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
		return "es.upv.paella.editor.trackAnnotations";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Annotations");
	},
	
	getColor:function() {
		return 'rgb(212, 212, 224)';
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
			return "Utiliza esta herramienta para crear, borrar y editar anotaciones. Para crear una anotación, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de las anotaciones";
		}
		else {
			return "Use this tool to create, delete and edit video annotations. To create an annotation, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the annotation text.";
		}
	},
	
	onSave:function(success) {
		var data = {
			annotations:this.tracks
		}
		paella.data.write('annotations',{id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.annotationsPlayerlugin.annotations = data.annotations;
			success(status);
		});
	}
});

paella.plugins.annotationsEditorPlugin = new paella.plugins.AnnotationsEditorPlugin();


paella.plugins.AnnotationsPlayerPlugin = Class.create(paella.EventDrivenPlugin,{
	annotations:null,
	lastEvent:0,
	
	visibleAnnotations:null,

	getName:function() { return "es.upv.paella.AnnotationsPlayerPlugin"; },
	checkEnabled:function(onSuccess) {
		var This = this;
		this.annotations = [];
		this.visibleAnnotations = [];
		paella.data.read('annotations',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.annotations && data.annotations.length>0) {
				This.annotations = data.annotations;
			}
			onSuccess(true);
		});
	},
		
	getEvents:function() { return [paella.events.timeUpdate]; },

	onEvent:function(eventType,params) {
		this.checkAnnotations(params);
	},

	checkAnnotations:function(params) {
		for (var i=0; i<this.annotations.length; ++i) {
			var a = this.annotations[i];
			if (a.s<params.currentTime && a.e>params.currentTime) {
				this.showAnnotation(a);
			}
		}
		
		for (var key in this.visibleAnnotations) {
			if (typeof(a)=='object') {
				var a = this.visibleAnnotations[key];
				if (a && (a.s>=params.currentTime || a.e<=params.currentTime)) {
					this.removeAnnotation(a);
				}
			}
		}
	},

	showAnnotation:function(annotation) {
		if (!this.visibleAnnotations[annotation.s]) {
			var rect = {left:100,top:10,width:1080,height:20};
			annotation.elem = paella.player.videoContainer.overlayContainer.addText(annotation.content,rect);
			annotation.elem.className = 'textAnnotation';
			this.visibleAnnotations[annotation.s] = annotation;
		}
	},

	removeAnnotation:function(annotation) {
		if (this.visibleAnnotations[annotation.s]) {
			var elem = this.visibleAnnotations[annotation.s].elem;
			paella.player.videoContainer.overlayContainer.removeElement(elem);
			this.visibleAnnotations[annotation.s] = null;
		}
	}
});

paella.plugins.annotationsPlayerlugin = new paella.plugins.AnnotationsPlayerPlugin();
