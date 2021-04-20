/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/



(function(){

class CaptionParserManager {
	addPlugin(plugin) {
		var self = this;
		var ext = plugin.ext;
		
		if ( ((Array.isArray && Array.isArray(ext)) || (ext instanceof Array)) == false) {
			ext = [ext]; 
		}
		if (ext.length == 0) {
			paella.log.debug("No extension provided by the plugin " + plugin.getName());
		}
		else {
			paella.log.debug("New captionParser added: " + plugin.getName());		
			ext.forEach(function(f){
				self._formats[f] = plugin;
			});
		}
	}

	constructor() {
		this._formats = {};
		paella.pluginManager.setTarget('captionParser', this);	
	}
}

let captionParserManager = new CaptionParserManager();

class SearchCallback extends paella.utils.AsyncLoaderCallback {
	constructor(caption, text) {
		super();
		this.name = "captionSearchCallback";
		this.caption = caption;
		this.text = text;
	}

	load(onSuccess, onError) {
		this.caption.search(this.text, (err, result) => {
			if (err) {
				onError();
			}
			else {
				this.result = result;
				onSuccess();
			}
		});
	}
}

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
		var asyncLoader = new paella.utils.AsyncLoader();
		
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


class Caption {
	constructor(id, format, url, lang, next) {
		this._id = id;
		this._format = format;
		this._url = url;
		this._captions = undefined;
		this._index = undefined;
		
		if (typeof(lang) == "string") { lang = {code: lang, txt: lang}; }
		this._lang = lang;
		this._captionsProvider = "downloadCaptionsProvider";
		
		this.reloadCaptions(next);
	}
	
	canEdit(next) {
		// next(err, canEdit)
		next(false, false);
	}
	
	goToEdit() {	
	
	}
	
	reloadCaptions(next) {
		var self = this;
	
		let xhrFields = paella.player.config.captions?.downloadOptions?.xhrFields || {};
		if (Object.keys(xhrFields).length) {
			xhrFields = null;
		}
		jQuery.ajax({
			url: self._url,
			cache:false,
			type: 'get',
			dataType: "text",
			xhrFields: null
		})
		.then(function(dataRaw){
			var parser = captionParserManager._formats[self._format];
			if (parser == undefined) {
				paella.log.debug("Error adding captions: Format not supported!");
				if (!paella.player.videoContainer) {
					paella.log.debug("Video container is not ready, delaying parse until next reload");
					return;
				}
				paella.player.videoContainer.duration(true)
				.then((duration)=>{
					self._captions = [{
						id: 0,
		            	begin: 0,
		            	end: duration,
		            	content: paella.utils.dictionary.translate("Error! Captions format not supported.")
					}];
					if (next) { next(true); }
				});
			}
			else {
				parser.parse(dataRaw, self._lang.code, function(err, c) {
					if (!err) {
						self._captions = c;
						self._index = lunr(function () {
							var thisLunr = this;
							thisLunr.ref('id');
							thisLunr.field('content', {boost: 10});
							self._captions.forEach(function(cap){
								thisLunr.add({
									id: cap.id,
									content: cap.content,
								});
							});
						});
					}
					if (next) { next(err); }
				});
			}
		})
		.fail(function(error){
			paella.log.debug("Error loading captions: " + self._url);
				if (next) { next(true); }
		});
	}
	
	getCaptions() {
		return this._captions;	
	}
	
	getCaptionAtTime(time) {
		if (this._captions != undefined) {
			for (var i=0; i<this._captions.length; ++i) {			
				var l_cap = this._captions[i];
				if ((l_cap.begin <= time) && (l_cap.end >= time)) {
					return l_cap;
				}
			}
		}
		return undefined;		
	}
	
	getCaptionById(id) {
		if (this._captions != undefined) {
			for (var i=0; i<this._captions.length; ++i) {			
				let l_cap = this._captions[i];
				if (l_cap.id == id) {
					return l_cap;
				}
			}
		}
		return undefined;
	}
	
	search(txt, next) {
		var self = this;	
		if (this._index == undefined) {
			if (next) {
				next(true, "Error. No captions found.");
			}
		}
		else {
			var results = [];
			paella.player.videoContainer.trimming()
				.then((trimming)=>{
					this._index.search(txt).forEach(function(s){
						var c = self.getCaptionById(s.ref);
						if(trimming.enabled && (c.end<trimming.start || c.begin>trimming.end)){
							return;
						}
						results.push({time: c.begin, content: c.content, score: s.score});
					});		
					if (next) {
						next(false, results);
					}
				});
		}
	}	
}

paella.captions.Caption = Caption;

class CaptionParserPlugIn extends paella.FastLoadPlugin {
	get type() { return 'captionParser'; }
	getIndex() {return -1;}
	
	get ext() {
		if (!this._ext) {
			this._ext = [];
		}
		return this._ext;
	}

	parse(content, lang, next) {
		throw new Error('paella.CaptionParserPlugIn#parse must be overridden by subclass');
	}
}

paella.CaptionParserPlugIn = CaptionParserPlugIn;


}());
