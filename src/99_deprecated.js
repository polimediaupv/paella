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


///////////////////////////////////////////////////////
// Deprecated functions/objects
//
//    Will be removed in next paella version.
///////////////////////////////////////////////////////


function DeprecatedClass(name, replacedBy, p) {
	Class (name, p, {
		initialize: function() {
			base.log.warning(name +  " is deprecated, use " + replacedBy + " instead.");
			this.parent.apply(this, arguments);
		}
	});
}

function DeprecatedFunc(name, replacedBy, func) {
	function ret(){
		base.log.warning(name +  " is deprecated, use " + replacedBy + " instead.");
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
paella.ajax = {};
paella.ajax['send'] = DeprecatedFunc("paella.ajax.send", "base.ajax.send", base.ajax.send);
paella.ajax['get'] = DeprecatedFunc("paella.ajax.get", "base.ajax.get", base.ajax.get);
paella.ajax['put'] = DeprecatedFunc("paella.ajax.put", "base.ajax.put", base.ajax.put);
paella.ajax['post'] = DeprecatedFunc("paella.ajax.post", "base.ajax.post", base.ajax.post);
paella.ajax['delete'] = DeprecatedFunc("paella.ajax.delete", "base.ajax.delete", base.ajax.send);



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




// paella.debug
///////////////////////////////////////////////////////
paella.debug = {
	log:function(msg) {
		base.log.warning("paella.debug.log is deprecated, use base.debug.[error/warning/debug/log] instead.");
		base.log.log(msg);
	}
};