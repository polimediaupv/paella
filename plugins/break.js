paella.plugins.BreaksEditorPlugin = Class.create(paella.editor.MainTrackPlugin,{
	tracks:null,
	selectedTrackItem:null,
	
	checkEnabled:function(onSuccess) {
		var This = this;
		this.tracks = [];
		paella.data.read('breaks',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.breaks && data.breaks.length>0) {
				This.tracks = data.breaks;
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Breaks':'Descansos',
				'Break':'Descanso',
				'Create a new break in the current position': 'Añade un descanso en el instante actual',
				'Delete selected break': 'Borra el descanso seleccionado'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new break in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected break')}
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
			var content = paella.dictionary.translate('Break');
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
		return "es.upv.paella.editor.trackBreaks";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Breaks");
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
		if (paella.utils.language()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar descansos. Para crear un descanso, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los descansos";
		}
		else {
			return "Use this tool to create, delete and edit breaks. To create a break, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the break text.";
		}
	},
	
	onSave:function(success) {
		var data = {
			breaks:this.tracks
		}
		paella.data.write('breaks',{id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.breaksPlayerPlugin.breaks = data.breaks;
			success(status);
		});
		
	}
});

paella.plugins.breaksEditorPlugin = new paella.plugins.BreaksEditorPlugin();


paella.plugins.BreaksPlayerPlugin = Class.create(paella.EventDrivenPlugin,{
	breaks:null,
	lastEvent:0,
	visibleBreaks:null,

	getName:function() { return "es.upv.paella.BreaksPlayerPlugin"; },
	checkEnabled:function(onSuccess) {
		var This = this;
		this.breaks = [];
		this.visibleBreaks = [];
		paella.data.read('breaks',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.breaks && data.breaks.length>0) {
				This.breaks = data.breaks;
			}
			onSuccess(true);
		});
	},
		
	getEvents:function() { return [paella.events.timeUpdate]; },

	onEvent:function(eventType,params) {
		this.checkBreaks(params);
	},
	
	checkBreaks:function(params) {
		for (var i=0; i<this.breaks.length; ++i) {
			var a = this.breaks[i];
			
			if (a.s<params.currentTime && a.e>params.currentTime) {
				this.showBreaks(a);
			} else if (a.s.toFixed(0) == params.currentTime.toFixed(0)){
				this.avoidBreak(a);
			}
		}
		
		for (var key in this.visibleBreaks) {
			if (typeof(a)=='object') {
				var a = this.visibleBreaks[key];
				if (a && (a.s>=params.currentTime || a.e<=params.currentTime)) {
					this.removeBreak(a);
				}
			}
		}
	},
	
	showBreaks:function(br) {
		if (!this.visibleBreaks[br.s]) {
			var rect = {left:100,top:350,width:1080,height:20};
			br.elem = paella.player.videoContainer.overlayContainer.addText(br.content,rect);
			br.elem.className = 'textBreak';
			this.visibleBreaks[br.s] = br;
		}
	},
	
	removeBreak:function(br) {
		if (this.visibleBreaks[br.s]) {
			var elem = this.visibleBreaks[br.s].elem;
			paella.player.videoContainer.overlayContainer.removeElement(elem);
			this.visibleBreaks[br.s] = null;
		}
	},
	
	avoidBreak:function(br){
		var newTime = br.e; 
		paella.events.trigger(paella.events.seekToTime,{time:newTime});
	}
});

paella.plugins.breaksPlayerPlugin = new paella.plugins.BreaksPlayerPlugin();
