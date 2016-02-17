Class ("paella.editor.ToolStatusPlugin",paella.editor.RightBarPlugin,{
	currentTrack:null,
	currentTextField:null,
	trackItemContainer:null,
	selectedColor:"rgb(255, 255, 236)",

	initialize:function() {
		this.parent();
		if (base.dictionary.currentLanguage()=='es') {
			var esDict = {
				'Tool':'Herramienta',
				'Selected tool':'Herramienta seleccionada',
				'this track does not contain any item':'esta pista no contiene ningún elemento',
				'Click on timeline outside any track to select current playback time.':'Haz clic en el fondo de la línea de tiempo para establecer el instante actual de reproducción',
				'Quick help':'Ayuda rápida',
				'item':'elemento',
				'items':'elementos',
				'from':'desde',
				'to':'hasta'
			};
			base.dictionary.addDictionary(esDict);
		}
	},

	getIndex:function() {
		return 10000;
	},

	getName:function() {
		return "es.upv.paella.editor.toolStatusPlugin";
	},

	getTabName:function() {
		return base.dictionary.translate("Tool");
	},

	getContent:function() {
		this.currentTextField = null;
		var elem = document.createElement('div');
		if (this.currentTrack) {
			var plugin = paella.pluginManager.getPlugin(this.currentTrack.getName());
			elem.innerHTML = "<h6>" + base.dictionary.translate("Tool") + ": " + base.dictionary.translate(this.currentTrack.getTrackName()) + "</h6>";
			var trackList = this.currentTrack.getTrackItems();
			var trackContainer = document.createElement('div');
			trackContainer.className = "editorPluginToolStatus_trackItemList";
			this.trackItemContainer = trackContainer;
			plugin.buildToolTabContent(trackContainer);
			if (trackContainer.childNodes.length==0) {
				for (var i=0;i<trackList.length;++i) {
					this.addTrackData(trackContainer,trackList[i]);
				}
			}
			elem.appendChild(trackContainer);
		}
		else {
			elem.innerHTML = "<h6>" + base.dictionary.translate("Tool") + ": " + base.dictionary.translate("Selection") + "</h6>";

		}

		this.addToolHelp(elem);

		return elem;
	},

	addTrackData:function(parent,track) {
		var trackData = document.createElement('div');
		//trackData.innerHTML = track.id + " s:" + track.s + ", e:" + track.e;
		var trackTime = document.createElement('div');
		var duration = Math.round((track.e - track.s) * 100) / 100;
		trackTime.innerHTML = base.dictionary.translate('from') + ' ' + paella.utils.timeParse.secondsToTime(track.s) + ' ' +
							  base.dictionary.translate('to') + ' ' + paella.utils.timeParse.secondsToTime(track.e) + ', ' +
							  duration + ' sec';
		trackData.appendChild(trackTime);
		if (track.content) {
			var content = paella.AntiXSS.htmlUnescape(track.content);
			this.addTrackContent(trackData,track.id,content,track.s,track.e);
		}
		parent.appendChild(trackData);
	},

	addTrackContent:function(parent,id,content,start,end) {
		var contentElem = null;
		var thisClass = this;
		if (this.currentTrack.allowEditContent()) {
			contentElem = document.createElement('input');
			contentElem.setAttribute('type', 'text');
			contentElem.setAttribute('id','trackContentEditor_' + id);
			contentElem.setAttribute('value',content);
			contentElem.trackData = {id:id,content:content,s:start,e:end};
			contentElem.plugin = this.currentTrack;
			$(contentElem).change(function(event) {
				this.plugin.onTrackContentChanged(this.trackData.id,$(this).val());
				paella.editor.instance.bottomBar.timeline.rebuildTrack(this.plugin.getName());
			});
			$(contentElem).click(function(event) {
				thisClass.onFocusChanged(this,this.plugin,this.trackData);
			});
			$(contentElem).focus(function(event) {
				thisClass.onFocusChanged(this,this.plugin,this.trackData);
			});

			var selectedTrackItemId = -1;
			try {
				selectedTrackItemId = this.currentTrack.trackInfo.trackData.id;
			}
			catch (e) { }
//paella.editor.instance.bottomBar.timeline.currentTrackList.currentTrack.trackInfo.trackData.id;
			if (selectedTrackItemId==id) {
				this.currentTextField = contentElem;
				this.currentTextField.style.backgroundColor = this.selectedColor;
			}
		}
		else {
			contentElem = document.createElement('input');
			contentElem.setAttribute('type', 'text');
			contentElem.setAttribute('id',id);
			contentElem.setAttribute('disabled','disabled');
			contentElem.setAttribute('style','color:rgb(119, 119, 119)');
			contentElem.setAttribute('value',content);
		}


		parent.appendChild(contentElem);
	},

	onFocusChanged:function(field,plugin,trackData) {
		if (this.currentTextField) {
			this.currentTextField.style.backgroundColor = "#fff";
		}
		field.style.backgroundColor = this.selectedColor;
		paella.editor.instance.bottomBar.timeline.focusTrackListItem(plugin.getName(),trackData.id);
		this.currentTextField = field;

		// Set the timeline position at the end of this track item
		var time = trackData.e;
		$(document).trigger(paella.events.seekToTime,{time:time});
	},

	onLoadFinished:function() {
		if (this.currentTextField) {
			this.trackItemContainer.scrollTop = $(this.currentTextField).position().top;
		}
	},

	addToolHelp:function(parent) {
		var helpText = "";
		if (this.currentTrack) {
			helpText = this.currentTrack.contextHelpString();
		}
		else {
			helpText = base.dictionary.translate("Click on timeline outside any track to select current playback time.");
		}

		if (helpText!="") {
			var helpElem = document.createElement('div');
			helpElem.className = "editorPluginToolStatusHelp";
			parent.appendChild(helpElem);
			helpElem.innerHTML = '<strong>' + base.dictionary.translate('Quick help') + ': </strong>' + helpText;
		}
	},

	onTrackSelected:function(newTrack) {
		this.currentTrack = newTrack;
	}
});

new paella.editor.ToolStatusPlugin();


/*


Class ("paella.editor.CaptionsPlugin",paella.editor.TrackPlugin,{
	tracks:[],
	selectedTrackItem:null,

	setup:function() {
		if (base.dictionary.currentLanguage()=="es") {
			var esDict = {
				'Captions':'Subtítulos',
				'Create':'Crear',
				'Delete':'Borrar'
			};
			base.dictionary.addDictionary(esDict);
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
			{name:'create',label:base.dictionary.translate('Create'),hint:base.dictionary.translate('Create a new caption in the current position')},
			{name:'delete',label:base.dictionary.translate('Delete'),hint:base.dictionary.translate('Delete selected caption')}
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
			this.tracks.push({id:id,s:start,e:end,content:base.dictionary.translate('Caption')});
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
		return base.dictionary.translate("Captions");
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
		if (base.dictionary.currentLanguage()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar subtítulos. Para crear un subtítulo, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los subtítulos";
		}
		else {
			return "Use this tool to create, delete and edit video captions. To create a caption, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the caption text.";
		}
	}
});

paella.editor.captionsPlugin = new paella.editor.CaptionsPlugin();

*/
