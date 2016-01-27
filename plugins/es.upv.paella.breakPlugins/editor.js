Class ("paella.plugins.BreaksEditorPlugin",paella.editor.MainTrackPlugin, {
	tracks:null,
	selectedTrackItem:null,

	checkEnabled:function(onSuccess) {
		var This = this;
		this.tracks = [];
		this.tracksData = [];
		paella.data.read('breaks',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.breaks && data.breaks.length>0) {
				This.tracks = data.breaks;
			}
			//Copy this.tracks on this.tracksData as backup.
			This.tracksData = JSON.parse(JSON.stringify(This.tracks));
			onSuccess(true);
		});
	},

	setup:function() {
		if (base.dictionary.currentLanguage()=="es") {
			var esDict = {
				'Breaks':'Descansos',
				'Break':'Descanso',
				'Create a new break in the current position': 'Añade un descanso en el instante actual',
				'Delete selected break': 'Borra el descanso seleccionado'
			};
			base.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},

	getTools:function() {
		return [
			{name:'create',label:base.dictionary.translate('Create'),hint:base.dictionary.translate('Create a new break in the current position')},
			{name:'delete',label:base.dictionary.translate('Delete'),hint:base.dictionary.translate('Delete selected break')}
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
			var content = base.dictionary.translate('Break');
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
		return "es.upv.paella.editor.trackBreaksPlugin";
	},

	getTrackName:function() {
		return base.dictionary.translate("Breaks");
	},

	getColor:function() {
		return 'rgb(219, 81, 81)';
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
		if (base.dictionary.currentLanguage()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar descansos. Para crear un descanso, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los descansos";
		}
		else {
			return "Use this tool to create, delete and edit breaks. To create a break, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the break text.";
		}
	},

	onSave:function(success) {
		var data = {
			breaks:this.tracks
		};
		paella.data.write('breaks',{id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.breaksPlayerPlugin.breaks = data.breaks;
			success(status);
		});
		//Update this.tracksData backup tracks
		this.tracksData = JSON.parse(JSON.stringify(this.tracks));

	},

	onDiscard:function(success) {
		//Override discarded changes using this.tracksData backup
		this.tracks = JSON.parse(JSON.stringify(this.tracksData));
		success(true);
	}
});

paella.plugins.breaksEditorPlugin = new paella.plugins.BreaksEditorPlugin();
