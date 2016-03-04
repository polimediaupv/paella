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


var searchServiceManager = new (Class ({
	_plugins: [],
	
	addPlugin: function(plugin) {
		this._plugins.push(plugin);
	},
	initialize: function() {
		paella.pluginManager.setTarget('SearchServicePlugIn', this);	
	}
}))();


var SearchCallback = Class (base.AsyncLoaderCallback, {
	initialize: function(plugin, text) {
		this.name = "searchCallback";
		this.plugin = plugin;
		this.text = text;
	},

	load: function(onSuccess, onError) {
		var self = this;
		this.plugin.search(this.text, function(err, result) {
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


paella.searchService = {
	
	search: function(text, next) {
		var asyncLoader = new base.AsyncLoader();
		
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



Class ("paella.SearchServicePlugIn", paella.FastLoadPlugin, {
	type:'SearchServicePlugIn',
	getIndex: function() {return -1;},
	
	search: function(text, next) {
		throw new Error('paella.SearchServicePlugIn#search must be overridden by subclass');
	}
});


}());