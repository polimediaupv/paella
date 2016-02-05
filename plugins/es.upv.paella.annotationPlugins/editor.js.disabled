Class ("paella.plugins.AnnotationsEditorPlugin",paella.editor.TrackPlugin, {
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
		if (base.dictionary.currentLanguage()=="es") {
			var esDict = {
				'Annotation':'Anotación',
				'Annotations':'Anotaciones'
			};
			base.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},

	getTools:function() {
		return [
			{name:'create',label:base.dictionary.translate('Create'),hint:base.dictionary.translate('Create a new caption in the current position')},
			{name:'delete',label:base.dictionary.translate('Delete'),hint:base.dictionary.translate('Delete selected caption')}
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
			var content = base.dictionary.translate('Annotation');
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
		return base.dictionary.translate("Annotations");
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
			//item.content = content;
			item.content = paella.AntiXSS.htmlEscape(content);
			//item.name = content;
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
		if (base.dictionary.currentLanguage()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar anotaciones. Para crear una anotación, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de las anotaciones";
		}
		else {
			return "Use this tool to create, delete and edit video annotations. To create an annotation, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the annotation text.";
		}
	},

	onSave:function(success) {
		var data = {
			annotations:this.tracks
		};
		paella.data.write('annotations', {id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.annotationsPlayerlugin.annotations = data.annotations;
			success(status);
		});
	}
});

paella.plugins.annotationsEditorPlugin = new paella.plugins.AnnotationsEditorPlugin();
