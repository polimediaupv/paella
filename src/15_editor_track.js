paella.editor.TrackUtils = {
	buildTrackItemId:function(trackName,trackItemId) {
		return 'paellaEditorTrack_' + trackName + '_' + trackItemId;
	},
};

paella.editor.Track = Class.create({
	container:null,
	plugin:null,
	trackIndex:{
		back:10,
		front:20
	},
	trackOpacity:{
		back:0.7,
		front:1
	},
	trackElemList:null,
	
	buildTrackItemId:function(trackName,trackItemId) {
		return paella.editor.TrackUtils.buildTrackItemId(trackName,trackItemId);
	},

	initialize:function(parentContainer,plugin,subclass) {
		this.trackElemList = [];
		this.plugin = plugin;
		var newTrackGroup = document.createElement('div');
		this.container = newTrackGroup;
		parentContainer.appendChild(newTrackGroup);
		this.buildTracks(newTrackGroup);
		type = plugin.getTrackType();
		if (type=="master") {
			newTrackGroup.className = "editorTrackListItem master " + subclass;
		}
		else if (type=="secondary") {
			newTrackGroup.className = "editorTrackListItem secondary " + subclass;
		}
	},
	
	getName:function() {
		return this.plugin.getName();
	},
	
	rebuild:function() {
		this.container.innerHTML = '';
		this.buildTracks(this.container);
	},

	buildTracks:function(container) {
		var plugin = this.plugin;
		var trackList = plugin.getTrackItems();
		for (var i in trackList) {
			var trackItem = this.getTrack(trackList[i]);
			this.trackElemList.push(trackItem);
			this.container.appendChild(trackItem);
		}
	},
	
	getTrack:function(trackData) {
		var thisClass = this;
		var plugin = this.plugin;
		var duration = paella.player.videoContainer.duration(true);
		trackData.d = trackData.e - trackData.s;
		var track = document.createElement('div');
		track.className = 'editorTrackItem ' + plugin.getName();
		track.id = this.buildTrackItemId(plugin.getName(),trackData.id);
		var start = trackData.s * 100 / duration;
		var width = trackData.d * 100 / duration;
		$(track).css({
			'left':start + '%',
			'width':width + '%',
			'background-color':plugin.getColor(),
			'opacity':this.trackOpacity.back
		});
		track.trackInfo = {
			trackData:trackData,
			plugin:plugin
		}
		
		var label = document.createElement('div');
		if (trackData.name && trackData.name!='') {
			label.innerHTML = trackData.name;
		}
		else {
			label.innerHTML = plugin.getTrackName();
		}
		
		label.className = 'editorTrackItemLabel ' + this.plugin.getTrackType();
		label.style.color = plugin.getTextColor();
		track.appendChild(label);
		
		if (!trackData.lock) {
			if (plugin.allowResize()) {
				var resizerL = document.createElement('div');
				resizerL.className = 'editorTrackItemResizer left';
				resizerL.track = track;
				track.appendChild(resizerL);
				var resizerR = document.createElement('div');
				resizerR.className = 'editorTrackItemResizer right';
				resizerR.track = track;
				track.appendChild(resizerR);
			
				$(resizerL).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'L',event);
				});
				$(resizerR).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'R',event);
				});
			}

			if (plugin.allowDrag()) {
				var moveArea = document.createElement('div');
				moveArea.className = 'editorTrackItemMoveArea';
				moveArea.track = track;
				track.appendChild(moveArea);
				$(moveArea).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'M',event);
				});				
			}
		}
		else {
			var lockIcon = document.createElement('i');
			lockIcon.className = 'editorTrackItemLock icon-lock icon-white';
			track.appendChild(lockIcon);
		}
		
		$(track).mousedown(function(event) {
			paella.editor.utils.mouse.mouseDownTarget = 'track';
			thisClass.onTrackDown(this,event);
		});
		
		$(document).mousemove(function(event) {
			thisClass.onResizerMove(event);
		});
		$(document).mouseup(function(event) {
			paella.editor.utils.mouse.mouseDownTarget = '';
			thisClass.onResizerUp(this.track,event);
		});
		$(track).dblclick(function(event) {
			thisClass.onDblClick(this.trackInfo,event);
		});
		return track;
	},
	
	
	currentTrack:null,
	resizeTrack:null,
	currentResizer:null,
	lastPos:{x:0,y:0},
	
	selectTrack:function(requestedTrack,noEvents) {
		if (typeof(requestedTrack)=="number") {
			for (var i=0;i<this.trackElemList.length;++i) {
				var trackElem = this.trackElemList[i];
				if (trackElem.trackInfo.trackData.id==requestedTrack) {
					requestedTrack = trackElem;
					break;
				}
			}
		}
		if (typeof(requestedTrack)!="number" && this.currentTrack!=requestedTrack) {
			if (!noEvents) this.onUnselect();
			for (var i=0;i<this.trackElemList.length;++i) {
				var trackElem = this.trackElemList[i];
				if (trackElem==requestedTrack) {
					this.currentTrack = trackElem;
					if (!noEvents) this.onSelect(trackElem.trackInfo);
					$(trackElem).css({
						'z-index':this.trackIndex.front,
						'opacity':this.trackOpacity.front
					});
				}
				else {
					$(trackElem).css({
						'z-index':this.trackIndex.back,
						'opacity':this.trackOpacity.back
					});
				}
			}
		}
	},
	
	onSelect:function(trackInfo) {
		this.plugin.onSelect(trackInfo.trackData);
	},
	
	onDblClick:function(track,event) {
		this.plugin.onDblClick(track.trackData);
	},
	
	onUnselect:function() {
		this.plugin.onUnselect();
	},
	
	onTrackDown:function(track,event) {
	// This will work only in secondary track items and in the first main track plugin:
		this.selectTrack(track);
		paella.editor.instance.bottomBar.toolbar.onToolChanged(this.plugin.getName(),this.plugin.getTrackName());
		
	},

	onResizerDown:function(track,resizer,event) {
		if (event) {
			this.resizeTrack = track;
			this.currentResizer = resizer;
			this.lastPos.x = event.clientX;
			this.lastPos.y = event.clientY;
		}
	},

	onResizerUp:function(track,event) {
		if (this.resizeTrack) {
			var duration = paella.player.videoContainer.duration(true);
			var totalWidth = $(this.container).width();
			var left = $(this.resizeTrack).position().left;
			var width = $(this.resizeTrack).width();
			left = left * 100 / totalWidth;
			width = width * 100 / totalWidth;
			var start = left * duration / 100;
			var end = (left + width) * duration / 100;
			
			var plugin = this.resizeTrack.trackInfo.plugin;
			var trackData = this.resizeTrack.trackInfo.trackData;
			plugin.onTrackChanged(trackData.id,start,end);
			paella.editor.pluginManager.onTrackChanged(plugin);
			paella.editor.instance.rightBar.updateCurrentTab();
			paella.editor.instance.bottomBar.timeline.rebuildTrack(plugin.getName());
			
			this.resizeTrack.trackInfo.trackData;

			$(this.resizeTrack).css({
				'left':left + '%',
				'width':width + '%'
			});
		}
		this.resizeTrack = null;
	},

	onResizerMove:function(event) {
		if (this.resizeTrack) {
			var diff = {
				x:event.clientX - this.lastPos.x,
				y:event.clientY - this.lastPos.y
			}
			var duration = paella.player.videoContainer.duration(true);
			var left = $(this.resizeTrack).position().left;
			var width = $(this.resizeTrack).width();
			
			//if (left<0) return;
			//else if ((left + width)>duration) return;
			if (this.currentResizer=='L') {
				left += diff.x;
				width -= diff.x;
				$(this.resizeTrack).css({'left':left + 'px','width':width + 'px'});
			}
			else if (this.currentResizer=='R') {
				width += diff.x;
				$(this.resizeTrack).css({'width':width + 'px'});
			}
			else if (this.currentResizer=='M') {	// Move track tool
				left +=diff.x;
				$(this.resizeTrack).css({'left':left + 'px'});
			}
			this.lastPos.x = event.clientX;
			this.lastPos.y = event.clientY;
		}
	}
});