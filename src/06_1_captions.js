/*
 Paella HTML 5 Multistream Player
 Copyright (C) 2013  Universitat Politècnica de València

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


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


var SearchCallback = Class (base.AsyncLoaderCallback, {
	initialize: function(caption, text) {
		this.name = "captionSearchCallback";
		this.caption = caption;
		this.text = text;
	},

	load: function(onSuccess, onError) {
		var self = this;
		this.caption.search(this.text, function(err, result) {
			if (err) {
				onError();
			}
			else {
				self.result = result;
				onSuccess();
			}
		});
	}
});

paella.captions = {
	parsers: {},
	_captions: {},
	_activeCaption: undefined,
		
	addCaptions: function(captions) {
		var cid = captions._captionsProvider + ':' + captions._id;		
		this._captions[cid] = captions;
		paella.events.trigger(paella.events.captionAdded, cid);
	},	
		
	getAvailableLangs: function() {
		var ret = [];
		var self = this;
		Object.keys(this._captions).forEach(function(k){
			var c = self._captions[k];
			ret.push({
				id: k,
				lang: c._lang
			});
		});
		return ret;
	},
	
	getCaptions: function(cid) {	
		if (cid && this._captions[cid]) {
			return this._captions[cid];
		}
		return undefined;
	},	
	
	getActiveCaptions: function(cid) {
		return this._activeCaption;
	},
	
	setActiveCaptions: function(cid) {
		this._activeCaption = this.getCaptions(cid);
		
		if (this._activeCaption != undefined) {				
			paella.events.trigger(paella.events.captionsEnabled, cid);
		}
		else {
			paella.events.trigger(paella.events.captionsDisabled);			
		}
		
		return this._activeCaption;
	},
		
	getCaptionAtTime: function(cid, time) {
		var c = this.getCaptions(cid);		
		if (c != undefined) {
			return c.getCaptionAtTime(time);
		}
		return undefined;			
	},
	
	search: function(text, next) {
		var self = this;
		var asyncLoader = new base.AsyncLoader();
		
		this.getAvailableLangs().forEach(function(l) {			
			asyncLoader.addCallback(new SearchCallback(self.getCaptions(l.id), text));
		});
		
		asyncLoader.load(function() {
				var res = [];
				Object.keys(asyncLoader.callbackArray).forEach(function(k) {
					res = res.concat(asyncLoader.getCallback(k).result);
				});
				if (next) next(false, res);
			},
			function() {
				if (next) next(true);
			}
		);		
	}
};


Class ("paella.captions.Caption", {
	initialize: function(id, format, url, lang, next) {
		this._id = id;
		this._format = format;
		this._url = url;
		this._captions = undefined;
		this._index = lunr(function () {
			this.ref('id');
			this.field('content', {boost: 10});
		});
		
		if (typeof(lang) == "string") { lang = {code: lang, txt: lang}; }
		this._lang = lang;
		this._captionsProvider = "downloadCaptionsProvider";
		
		this.reloadCaptions(next);
	},
	
	canEdit: function(next) {
		// next(err, canEdit)
		next(false, false);
	},
	
	goToEdit: function() {	
	
	},	
	
	reloadCaptions: function(next) {
		var self = this;
	
	
		jQuery.ajax({
			url: self._url,
			cache:false,
			type: 'get',
			dataType: "text"
		})
		.done(function(dataRaw){
			var parser = captionParserManager._formats[self._format];			
			if (parser == undefined) {
				base.log.debug("Error adding captions: Format not supported!");
				if (next) { next(true); }
			}
			else {
				parser.parse(dataRaw, self._lang.code, function(err, c) {
					if (!err) {
						self._captions = c;
						
						self._captions.forEach(function(cap){
							self._index.add({
								id: cap.id,
								content: cap.content,
							});				
						});							
					}
					if (next) { next(err); }						
				});
			}			
		})
		.fail(function(error){
			base.log.debug("Error loading captions: " + self._url);
				if (next) { next(true); }
		});
	},
	
	getCaptions: function() {
		return this._captions;	
	},
	
	getCaptionAtTime: function(time) {
		if (this._captions != undefined) {
			for (var i=0; i<this._captions.length; ++i) {			
				l_cap = this._captions[i];
				if ((l_cap.begin <= time) && (l_cap.end >= time)) {
					return l_cap;
				}
			}
		}
		return undefined;		
	},
	
	getCaptionById: function(id) {
		if (this._captions != undefined) {
			for (var i=0; i<this._captions.length; ++i) {			
				l_cap = this._captions[i];
				if (l_cap.id == id) {
					return l_cap;
				}
			}
		}
		return undefined;
	},
	
	search: function(txt, next) {
		var self = this;	
		if (this._index == undefined) {
			if (next) {
				next(true, "Error. No captions found.");
			}
		}
		else {
			var results = [];
			this._index.search(txt).forEach(function(s){
				var c = self.getCaptionById(s.ref);
				
				results.push({time: c.begin, content: c.content, score: s.score});
			});		
			if (next) {
				next(false, results);
			}
		}
	}	
});




Class ("paella.CaptionParserPlugIn", paella.FastLoadPlugin, {
	type:'captionParser',
	getIndex: function() {return -1;},
	
	ext: [],
	parse: function(content, lang, next) {
		throw new Error('paella.CaptionParserPlugIn#parse must be overridden by subclass');
	}
});



}());