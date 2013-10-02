paella.plugins.AnnotationsEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:[],
	selectedTrackItem:null,
	
	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Captions':'Subtítulos',
				'Create':'Crear',
				'Delete':'Borrar'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		for (var i=0;i<this.tracks.length;++i) {
			this.tracks[i].name = this.tracks[i].content;
		}
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new caption in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected caption')}
		];
	},
	
	getTrackItemIndex:function(item) {
//		return this.tracks.indexOf(item);
		for(var i=0;i<this.tracks.length;++i) {
			if (item.id==this.tracks[i].id) {
				return i;
			}
		}
		return -1;
	},

	onToolSelected:function(toolName) {
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			this.tracks.splice(this.getTrackItemIndex(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			var start = paella.player.videoContainer.currentTime();
			var end = start + 60;
			var id = this.getTrackUniqueId();
			this.tracks.push({id:id,s:start,e:end,content:paella.dictionary.translate('Caption')});
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
		return 'rgb(212, 212, 224)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		var item = this.getTrackItem(id);
		if (item) {
			item.s = start;
			item.e = end;
			this.selectedTrackItem = item;
		}
	},
	
	onTrackContentChanged:function(id,content) {
		var item = this.getTrackItem(id);
		if (item) {
			item.content = content;
			item.name = content;
		}
	},
	
	allowEditContent:function() {
		return false;
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
	}
});

paella.plugins.annotationsEditorPlugin = new paella.plugins.AnnotationsEditorPlugin();



