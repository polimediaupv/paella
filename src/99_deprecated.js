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
		func.apply(arguments);
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
paella.ajax = base.ajax;

// Deprecated: use paella.ajax.get/post/delete/put...
Class ("paella.Ajax", {
	callback:null,

	// Params:
	//	url:http://...
	//	data:{param1:'param1',param2:'param2'...}
	// 	onSuccess:function(response)
	initialize:function(url,params,onSuccess,proxyUrl,useJsonp,method) {
		paella.debug.log("WARNING: paella.Ajax() is deprecated, use base.ajax.get/base.ajax.post/base.ajax.delete/base.ajax.put instead.");
		var thisClass = this;
		this.callback = onSuccess;
		if (!method) method = 'get';
		if (useJsonp) {
            jQuery.ajax({url:url,type:method,dataType:'jsonp', jsonp:'jsonp', jsonpCallback:'callback', data:params,cache:false}).always(function(data) {
				//paella.debug.log('using jsonp');
				thisClass.callCallback(data);
			});
		}
		else if (proxyUrl && proxyUrl!=="") {
			params.url = url;
			jQuery.ajax({url:proxyUrl,type:method,data:params,cache:false}).always(function(data) {
				//paella.debug.log('using AJAX');
				thisClass.callCallback(data);
			});
		}
		else {
			jQuery.ajax({url:url,type:method,data:params,cache:false}).always(function(data) {
				//paella.debug.log('using AJAX whithout proxy');
				thisClass.callCallback(data);
			});
		}
	},

	callCallback:function(data) {
		if (this.callback && data!=null) {
			if (typeof(data)=="object" && data.responseText) {
				this.callback(data.responseText);
			}
			else {
				this.callback(data);
			}
		}
		else if (this.callback) {
			this.callback('{"result":"ok"}');
		}
	}
});




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

