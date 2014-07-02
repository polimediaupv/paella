
var DfxpParser =  Class.create({
    parseCaptions:function(text) {
        var xml = $(text);
        var ps = xml.find("div p");
        var captions= [];
        var i = 0;
        for (i=0; i< ps.length; i++) {
            var c = this.getCaptionInfo(ps[i]);
            c.id = i;
            captions.push(c);
        }
        return captions;
    },

    getCaptionInfo:function(cap) {
            var b = this.parseTimeTextToSeg(cap.getAttribute("begin"));
            var d = this.parseTimeTextToSeg(cap.getAttribute("end"));
            var v = $(cap).text();

            return {s:b, d:d, e:b+d, name:v, content:v};
    },

    parseTimeTextToSeg:function(ttime){
            var nseg = 0;
            var segtime = /^([0-9]*([.,][0-9]*)?)s/.test(ttime);
            if (segtime){
                    nseg = parseFloat(RegExp.$1);
            }
            else {
                    var split = ttime.split(":");
                    var h = parseInt(split[0]);
                    var m = parseInt(split[1]);
                    var s = parseInt(split[2]);
                    nseg = s+(m*60)+(h*60*60);
            }
            return nseg;
    },

    captionsToDfxp:function(captions){
            var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml = xml + '<tt xml:lang="en" xmlns="http://www.w3.org/2006/10/ttaf1" xmlns:tts="http://www.w3.org/2006/04/ttaf1#styling">\n';
            xml = xml + '<body><div xml:id="captions" xml:lang="en">\n';

            for (var i=0; i<captions.length; i=i+1){
                    var c = captions[i];
                    xml = xml + '<p begin="'+ paella.utils.timeParse.secondsToTime(c.begin) +'" end="'+ paella.utils.timeParse.secondsToTime(c.duration) +'">' + c.value + '</p>\n';
            }
            xml = xml + '</div></body></tt>';
            return xml;
    }
});


paella.plugins.CaptionsPlayerPlugin = Class.create(paella.EventDrivenPlugin,{
	captions:[],
	captionsEnabled: false,
	
	root: null,
	element:null,

	getName:function() { return "es.upv.paella.captionsPlayerPlugin"; },
	getEvents:function() { return [paella.events.timeUpdate]; },
	checkEnabled:function(onSuccess) { onSuccess(true); },

	setup:function() {
		this.root = document.createElement("div");
		this.root.className = 'es.upv.paella.captionsPlayerPlugin.overlay';			
		this.element = document.createElement("div");
		this.element.className = 'textCaption';
		this.root.appendChild(this.element);
		
		this.setEnable(false);
		var overlayContainer = paella.player.videoContainer.overlayContainer;
		var rect = {left:100,top:620,width:1080,height:20};
		overlayContainer.addElement(this.root, rect);		
	},
		

	onEvent:function(eventType,params) {
		if (this.captionsEnabled == true) {
			this.checkCaptions(params);
		}
	},	
	
	checkCaptions:function(params) {
		if (this.captionsEnabled == true) {
			var caption;
			var isCaptionVisible = false;
			for (var i=0; i<this.captions.length; ++i) {
				caption = this.captions[i];
				if ((caption.s < params.currentTime) && (caption.e > params.currentTime)) {
					this.element.innerHTML = caption.content;
					isCaptionVisible = true;
					jQuery(this.element).show();			
				}
			}
			
			if (isCaptionVisible == false) {
				this.element.innerHTML = '';
				jQuery(this.element).hide();			
			}
		}
	},	
	
	
	// Public Interface
	///////////////////
	isEnabled: function() {return this.captionsEnabled;},
	setEnable: function(enable) { 
		if (enable == undefined) { enable = true; }
		this.captionsEnabled = enable;
		if (this.captionsEnabled) {
			jQuery(this.element).show();
		}
		else {
			jQuery(this.element).hide();			
		}
	},
	enable: function(enable) {this.setEnable(true); },
	disable: function() {this.setEnable(false); },
			
	setCaptions: function(captions) { this.captions = captions;},
	getCaptions: function() {return this.captions; },
	loadCaptions: function(url, format, done) {
		var thisClass = this;
		paella.utils.ajax.get({url: url},
			function(data, contentType, returnCode, dataRaw) {
				var parser = new DfxpParser();
				thisClass.captions = parser.parseCaptions(dataRaw);
				done(false);
			},						
			function(data, contentType, returnCode) {
				done(true);
			}
		);
	}
});


paella.plugins.captionsPlayerlugin = new paella.plugins.CaptionsPlayerPlugin();
