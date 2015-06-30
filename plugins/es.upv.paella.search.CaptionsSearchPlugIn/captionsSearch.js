/////////////////////////////////////////////////
// Caption Search
/////////////////////////////////////////////////
Class ("paella.plugins.CaptionsSearchPlugIn", paella.SearchServicePlugIn, {
	getName: function() { return "es.upv.paella.search.captionsSearchPlugin"; },

	search: function(text, next) {
		paella.captions.search(text, next);
	}	
});

new paella.plugins.CaptionsSearchPlugIn();