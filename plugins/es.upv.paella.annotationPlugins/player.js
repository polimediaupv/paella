Class ("paella.plugins.AnnotationsPlayerPlugin",paella.EventDrivenPlugin,{
	annotations:null,
	lastEvent:0,

	visibleAnnotations:null,

	getName:function() { return "es.upv.paella.annotationsPlayerPlugin"; },
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
		var a;
		for (var i=0; i<this.annotations.length; ++i) {
			a = this.annotations[i];
			if (a.s<params.currentTime && a.e>params.currentTime) {
				this.showAnnotation(a);
			}
		}

		for (var key in this.visibleAnnotations) {
			if (typeof(a)=='object') {
				a = this.visibleAnnotations[key];
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
