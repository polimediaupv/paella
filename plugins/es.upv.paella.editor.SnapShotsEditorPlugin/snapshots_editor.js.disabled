Class ("paella.plugins.SnapShotsEditorPlugin",paella.editor.TrackPlugin,{
	tracks:null,
	selectedTrackItem:null,
	highResFrames:null,

	getIndex:function() { return 0; },

	checkEnabled:function(onSuccess) {
		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		onSuccess(frames!=null);
	},

	setup:function() {
		if (base.dictionary.currentLanguage()=="es") {
			var esDict = {
				'Slides':'Diapositivas',
				'Slide': 'Diapositiva'
			};
			base.dictionary.addDictionary(esDict);
		}
	},


	showHiResFrame:function(url) {
		var frameRoot = document.createElement("div");
		var frame = document.createElement("div");
		var hiResImage = document.createElement('img');
        hiResImage.className = 'frameHiRes';
        hiResImage.setAttribute('src',url);
        hiResImage.setAttribute('style', 'width: 100%;');

		$(frame).append(hiResImage);
		$(frameRoot).append(frame);

        frameRoot.setAttribute('style', 'display: table;');
        frame.setAttribute('style', 'display: table-cell; vertical-align:middle;');
		overlayContainer = paella.player.videoContainer.overlayContainer;

		var streams = paella.initDelegate.initParams.videoLoader.streams;
		if (streams.length == 1){
			overlayContainer.addElement(frameRoot, overlayContainer.getMasterRect());
		}
		else if (streams.length >= 2){
			overlayContainer.addElement(frameRoot, overlayContainer.getSlaveRect());
		}
		overlayContainer.enableBackgroundMode();
		this.hiResFrame = frameRoot;
	},

	removeHiResFrame:function() {
		overlayContainer = paella.player.videoContainer.overlayContainer;
		overlayContainer.removeElement(this.hiResFrame);
		overlayContainer.disableBackgroundMode();
	},


	createTrackContent: function(frameItem, numSlide) {
		onMouseOverScript = "paella.plugins.snapShotsEditorPlugin.showHiResFrame('" + frameItem.url + "');";
		onMouseOutScript = "paella.plugins.snapShotsEditorPlugin.removeHiResFrame();";

		return 	'<div class="snapShotsEditorPluginBox" onmouseover="'+ onMouseOverScript + '" onmouseout="' + onMouseOutScript + '">' +
				'	<img class="snapShotsEditorPluginImage" src="' + frameItem.thumb + '"/>' +
				'	<div class="snapShotsEditorPluginSliteText">'+ base.dictionary.translate("Slide") + ' ' + numSlide +'</div>' +
				'</div>';
	},

	getTrackItems:function() {
		if (this.tracks == null) {
			this.tracks = [];
			var frames = paella.initDelegate.initParams.videoLoader.frameList;
			if (frames) {
				var frameItem,s,e,d;
				var numFrame = 0;
				var keys = Object.keys(paella.initDelegate.initParams.videoLoader.frameList);

				for (;numFrame< keys.length-1; numFrame++) {
					frameItem = frames[keys[numFrame]];
					s = parseInt(keys[numFrame]);
					e = parseInt(keys[numFrame+1]);
					d = e-s;
					this.tracks.push({s:s, e:e, d:d, name: this.createTrackContent(frameItem, numFrame+1)});
				}
				if (keys.length > 0){
					frameItem = frames[keys[numFrame]];
					s = parseInt(keys[numFrame]);
					e = paella.player.videoContainer.duration();
					d = e-s;
					this.tracks.push({s:s, e:e, d:d, name: this.createTrackContent(frameItem, numFrame+1)});
				}
			}
		}
		return this.tracks;
	},

	getTools:function() {
		return [];
	},

	onToolSelected:function(toolName) {
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
		return "es.upv.paella.editor.snapShotsEditorPlugin";
	},

	getTrackName:function() {
		return base.dictionary.translate("Slides");
	},

	getColor:function() {
		return 'rgb(159, 166, 88)';
	},

	getTextColor:function() {
		return 'rgb(90,90,90)';
	},

	allowEditContent:function() {
		return false;
	},
	allowDrag:function() {
		return false;
	},
	allowResize:function() {
		return false;
	},

	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},

	onSave:function(success) {
		success(true);
	}
});

paella.plugins.snapShotsEditorPlugin = new paella.plugins.SnapShotsEditorPlugin();
