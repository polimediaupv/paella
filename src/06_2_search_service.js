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