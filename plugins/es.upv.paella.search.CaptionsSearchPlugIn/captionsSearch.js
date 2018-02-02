/////////////////////////////////////////////////
// Caption Search
/////////////////////////////////////////////////
paella.addPlugin(function() {
	return class CaptionsSearchPlugIn extends paella.SearchServicePlugIn {
		getName() { return "es.upv.paella.search.captionsSearchPlugin"; }
	
		search(text, next) {
			paella.captions.search(text, next);
		}	
	}
});
