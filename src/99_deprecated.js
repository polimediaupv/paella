///////////////////////////////////////////////////////
// Deprecated functions/objects
//
//    Will be removed in next paella version.
///////////////////////////////////////////////////////


function DeprecatedClass(name, replacedBy, p) {
	Class (name, p, {
		initialize: function() {
			paella.debug.log("WARNING: " + name +  " is deprecated, use " + replacedBy + " instead.");
			this.parent.apply(this, arguments);
		}
	});
}

function DeprecatedFunc(name, replacedBy, func) {
	function ret(){
		paella.debug.log("WARNING: " + name +  " is deprecated, use " + replacedBy + " instead.");
		func.apply(this, arguments);
	}
	
	return ret;
}

// Pella Dictionary
///////////////////////////////////////////////////////
DeprecatedClass("paella.Dictionary", "base.Dictionary", base.Dictionary);
paella.dictionary = base.dictionary;

// Paella AsyncLoader
///////////////////////////////////////////////////////
DeprecatedClass("paella.AsyncLoaderCallback", "base.AsyncLoaderCallback", base.AsyncLoaderCallback);
DeprecatedClass("paella.AjaxCallback", "base.AjaxCallback", base.AjaxCallback);
DeprecatedClass("paella.JSONCallback", "base.JSONCallback", base.JSONCallback);
DeprecatedClass("paella.DictionaryCallback", "base.DictionaryCallback", base.DictionaryCallback);
DeprecatedClass("paella.AsyncLoader", "base.AsyncLoader", base.AsyncLoader);

// Paella Timer
///////////////////////////////////////////////////////
DeprecatedClass("paella.Timer", "base.Timer", base.Timer);
DeprecatedClass("paella.utils.Timer", "base.Timer", base.Timer);


// Paella Ajax
///////////////////////////////////////////////////////
paella.ajax = {
	send: DeprecatedFunc("paella.ajax.send", "base.ajax.send", base.ajax.send),
	get: DeprecatedFunc("paella.ajax.get", "base.ajax.get", base.ajax.get),
	put: DeprecatedFunc("paella.ajax.put", "base.ajax.put", base.ajax.put),
	post: DeprecatedFunc("paella.ajax.post", "base.ajax.post", base.ajax.post),
	'delete': DeprecatedFunc("paella.ajax.delete", "base.ajax.delete", base.ajax.send)
};


// Paella UI
///////////////////////////////////////////////////////
paella.ui = {};

paella.ui.Container = function(params) {
	var elem = document.createElement('div');
	if (params.id) elem.id = params.id;
	if (params.className) elem.className = params.className;
	if (params.style) $(elem).css(params.style);
	return elem;
};




// paella.utils
///////////////////////////////////////////////////////
paella.utils.ajax = base.ajax;
paella.utils.cookies = base.cookies;
paella.utils.parameters = base.parameters;
paella.utils.require = base.require;
paella.utils.importStylesheet = base.importStylesheet;
paella.utils.language = base.dictionary.currentLanguage;
paella.utils.uuid = base.uuid;
paella.utils.userAgent = base.userAgent;