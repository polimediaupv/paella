(function(){


var captionParserManager = new (Class ({
	_formats: {},
	
	addPlugin: function(plugin) {
		var self = this;
		var ext = plugin.ext;
		
		if ( ((Array.isArray && Array.isArray(ext)) || (ext instanceof Array)) == false) {
			ext = [ext]; 
		}
		if (ext.length == 0) {
			base.log.debug("No extension provided by the plugin " + plugin.getName());
		}
		else {
			base.log.debug("New captionParser added: " + plugin.getName());		
			ext.forEach(function(f){
				self._formats[f] = plugin;
			});
		}
	},
	initialize: function() {
		paella.pluginManager.setTarget('captionParser', this);	
	}
}))();


paella.captions = {
	parsers: {},
	_captions: {},
	
	addCaptions: function(format, content, langs) {
		var self = this;
		var parser = captionParserManager._formats[format];			
		if (parser == undefined) {
			base.log.debug("Error adding captions: Format not supported!");
		}
		else {
			parser.parse(content, langs, function(err, c) {
				if (!err) {
					Object.keys(c).forEach(function(k){
						self._captions[k] = c[k];
					});
				}				
			});
		}
	},
	
	loadCaptions: function(format, url, langs, next) {
		var self = this;
		
		if (typeof(langs) == "string") { langs = [langs]; }
		if (next == undefined) { next = function(){}; }
		
		base.ajax.get({url: url},
			function(data, contentType, returnCode, dataRaw) {
				self.addCaptions(format, dataRaw, langs);
				next();
			},						
			function(data, contentType, returnCode) {
				base.log.debug("Error loading captions: " + url);
				var err = true;
				next(err);
			}
		);		
	},
		
	getLangs: function() {
		return Object.keys(a); 
	},
	
	getCaptions: function(lang) {
		if (lang) {
			return this._captions[lang];
		}
		else {
			return this._captions;
		}
	},
	
	getCaptionAtTime: function(lang, time) {
		var l_captions = this._captions[lang];
		if (l_captions) {			
			for (var i=0; i<l_captions.length; ++i) {
			
				l_cap = l_captions[i];
				if ((l_cap.begin <= time) && (l_cap.end >= time)) {
					return l_cap.content;
				}
			}		
		}
		
		return undefined;			
	},
	
	search: function(txt, next) {
		var self = this;
		
		var index = lunr(function () {
			this.ref('id');
			this.field('content', {boost: 10});
		});
		
		Object.keys(self._captions).forEach(function(l){
			self._captions[l].forEach(function(c){				
				index.add({
					id: "caption:" + l +":"+c.begin,
					content: c.content,
				});				
			});			
		});
		
		var results = [];
		index.search(txt).forEach(function(s){
			var v = s.ref.split(":");
			var t = parseFloat(v[2]);
			var c = self.getCaptionAtTime(v[1], t);
			
			results.push({time: t, content: c, score: s.score});
		});		
		
		next(false, results);
	}
};




Class ("paella.CaptionParserPlugIn", paella.FastLoadPlugin, {
	type:'captionParser',
	getIndex: function() {return -1;},
	
	ext: [],
	parse: function(content, langs, next) {
		next("Error: No parse() function defined!");
	}
});





/////////////////////////////////////////////////
// DXFP Parser
/////////////////////////////////////////////////
Class ("paella.captions.parsers.DXFPParser", paella.CaptionParserPlugIn, {
	ext: ["dxfp"],
	getName: function() { return "es.upv.paella.captions.DXFPParser"; },
	parse: function(content, langs, next) {
		var captions={};
		var self = this;
		var xml = $(content);
		var g_lang = xml.attr("xml:lang");
		
		var lls = xml.find("div");
		lls.each(function(idx, ll){
			var l_captions = [];
			ll = $(ll);
			var l_lang = ll.attr("xml:lang");
			if ((l_lang == undefined) || (l_lang == "")){
				if ((g_lang == undefined) || (g_lang == "")) {
					base.log.debug("No xml:lang found! Using '" + langs[0] + "' lang instead.");
					l_lang = langs[0];
				}
				else {
					l_lang = g_lang;					
				}
			}
			//
			ll.find("p").each(function(i, cap){
				var c = {
					id: i,
	            	begin: self.parseTimeTextToSeg(cap.getAttribute("begin")),
	            	end: self.parseTimeTextToSeg(cap.getAttribute("end")),
	            	content: $(cap).text().trim()
	            };				
				l_captions.push(c);				
			});
			captions[l_lang] = l_captions;
		});
		next(false, captions);
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
    }
});

new paella.captions.parsers.DXFPParser();



}());