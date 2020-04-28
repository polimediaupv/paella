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


var searchServiceManager = {
	_plugins: [],
	
	addPlugin: function(plugin) {
		this._plugins.push(plugin);
	},

	initialize: function() {
		paella.pluginManager.setTarget('SearchServicePlugIn', this);	
	}
};


class SearchCallback extends paella.utils.AsyncLoaderCallback {
	constructor(plugin, text) {
		super();
		this.name = "searchCallback";
		this.plugin = plugin;
		this.text = text;
	}

	load(onSuccess, onError) {
		this.plugin.search(this.text, (err, result) => {
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


paella.searchService = {
	
	search: function(text, next) {
		let asyncLoader = new paella.utils.AsyncLoader();
		
		paella.userTracking.log("paella:searchService:search", text);
		
		searchServiceManager._plugins.forEach(function(p) {
			asyncLoader.addCallback(new SearchCallback(p, text));
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


class SearchServicePlugIn extends paella.FastLoadPlugin {
	get type() { return 'SearchServicePlugIn'; }
	getIndex() {return -1;}
	
	search(text, next) {
		throw new Error('paella.SearchServicePlugIn#search must be overridden by subclass');
	}
}

paella.SearchServicePlugIn = SearchServicePlugIn;
searchServiceManager.initialize();

}());