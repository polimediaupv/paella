# Paella Utilities #
## About Paella Utilities ##
The paella utilities framework provides with a series of tools to make the most simple and common tasks in the most easy way. It also meets with a secondary objective: the standardization of some tasks that are easy enough to do in other ways, but it is preferable to do them always in the same way.

The Paella Utility Framework are divided in two sections: Paella Utility Classes (PUC) and Paella Utility Objects (PUO). The main difference between PUC and PUO is that in the first case we'll use these utilities through instantiation, while in the second case we'll use the predefined objects without the need to instantiate them. All objects in PUO are accessible through the `paella.utils` namespace, while the PUC classes are defined directly inside the `paella` namespace

## Paella Utility Classes ##

paella.Ajax
-----------

### paella.Ajax is deprecated, use paella.utils.ajax instead

Provides with an standarized way to make Ajax requests. Example:

	var url = "resource_url";
	var params = {param1:'value 1',param2:'value 2'};
	var success = function(data) {
		console.log("Load success");
	}
	var useJsonp = false;
	var method = 'post';
	new paella.Ajax(url,params,onSuccess,proxyUrl,useJsonp,method);

Notes: [more info about jsonp](http://en.wikipedia.org/wiki/JSONP)


paella.AsyncLoader, paella.AsyncLoaderCallback
----------------------------------------------

Provides with a mechanism that allows us to concatenate a series of asynchronous calls, following a predefined order. The asynchronous loaded is based on the Chain of Responsability design pattern. The command and/or processing object in the asynchronous loader must be a subclass of `paella.AsyncLoaderCallback`. This class implements an asynchronous operation, and when this operation is finished, will pass the responsibility to the next operation in the chain.

paella.AsyncLoader: example of use

	var loader = new paella.AsyncLoader();
	
	loader.addCallback(new MyLoaderCallback1("loader1"));
	loader.addCallback(new MyLoaderCallback2("loader2"));
	loader.addCallback(new MyLoaderCallback3("loader3"));
	
	loader.load(function() {
					console.log("Operation successfully completed");
				},
				function() {
					console.log("Load error");
				});


paella.AsyncLoaderCallback: Implement a callback:

	var MyLoaderCallback1 = Class.create(paella.AsyncLoader,{
		dataToLoad:null,

		initialize:function(name) { this.parent(name); },
		
		load:function(onSuccess,onError) {
			var url = "my_config_file.json";
			var params = {}
			var This = this;
			new paella.Ajax(url,params,function(data) {
				try {
					This.dataToLoad = JSON.parse(data);
					onSuccess();
				}
				catch (e) {
					onError();
				}
			})
		}
	});

paella.Timer
------------

Improved javascript timers. Example: repeat "Hello, paella.Timer" ten times, one per second:

	var t = 1000; // one second
	var counter = 0;
	var numberOfMessages = 10;
	var timer = new paella.Timer(function(timer) {
			console.log("Hello, paella.Timer");
			counter++;
			if (counter==numberOfMessages) {
				timer.cancel;
			}
		},t);
	timer.repeat = true;


paella.Data
-----------

Provides with a homogeneous mechanism to write and read persistent data. paella.Data is implemented based on the Delegate design pattern. It delegates the reading and writting operations on an object that knows where read from and write to data. To setup the delegate objects, you must to implement them and use the paella player's `config.json` file to register them.

	paella.data.write("myContext","key",{data:"my data"},function(response,status) {
		if (status) console.log("data successfully writted");
		else console.log("error writting data");
	});

	paella.data.read("myContext","key",function(data) {
		console.log(data);
	});

paella.DataDelegate: Implements paella.Data delegates
-----------

Example: cookie-based reader and writter delegate

	paella.dataDelegates.CookieDataDelegate = Class.create(paella.DataDelegate,{
		initialize:function() {
		},
	
		read:function(context,params,onSuccess) {
			if (typeof(params)=='object') params = JSON.stringify(params);
			var value = paella.utils.cookies.get(params);
			try {
				value = JSON.parse(value);
			}
			catch (e) {}
			if (typeof(onSuccess)=='function') {
				onSuccess(value,true);
			}
		},
	
		write:function(context,params,value,onSuccess) {
			if (typeof(params)=='object') params = JSON.stringify(params);
			if (typeof(value)=='object') value = JSON.stringify(value);
			paella.utils.cookies.set(params,value);
			if(typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}
	});

Register cookie data delegate in config.json

	{
		...
		"data":{
			"enabled":true,
			"dataDelegates":{
				"default":"CookieDataDelegate",
				"myContext":"CookieDataDelegate"
			}
		}
	}


## Paella Utility Objects ##

paella.utils.ajax: send AJAX request. You can also use the shorter form "paella.ajax"
--------------------

	paella.utils.ajax.get(params,onSuccess,onFail): Send a 'GET' request
	paella.utils.ajax.post(params,onSuccess,onFail): Send a 'POST' request
	paella.utils.ajax.put(params,onSuccess,onFail): Send a 'PUT' request
	paella.utils.ajax.delete(params,onSuccess,onFail): Send a 'DELETE' request

- params: Object containing the following data:

	- url: server URL.
	- params: object containing the key/value form request parameters. This parameter is optional

- onSuccess, onFail: AJAX return callbacks. Both have the following parameters:
	- data: Result data. This data will be parsed if Paella know how to do it, for example, if the result data mimetype is application/json, this parameter will be a JavaScript object.
	- mimetype: Mimetype string.
	- responseCode: Server result code
	- rawData: Unparsed result data.
	
	

paella.utils.cookies: set and get cookies
--------------------

	paella.utils.set('myCookie','value of myCookie');
	var myCookie = paella.utils.get('myCookie');


paella.utils.parameters: parse URL parameters
--------------------

http://myserver.com/my_paella_player/?id=video1

	var param = paella.utils.parameters.get("id")

now the `param` variable contains "video1"

paella.utils.require: include javascript files in the HTML header
--------------------

	paella.utils.require("javascript/myfile.js")

paella.utils.importStylesheet: include stylesheet files in the HTML header
--------------------

	paella.utils.importStylesheet("style/mystylesheet.css")

Keep in mind that there is no way to know when the stylesheet file is loaded, and the new styles will not be available inmediately after calling importStylesheet

paella.utils.timeParse: time parsing utilities
--------------------

	paella.utils.timeParse.secondsToTime(34599) => will return: "09:36:39"

paella.utils.language: returns the current browser language code
--------------------

paella.utils.userAgent: user agent string parsing utilities. 
--------------------

You can test it in your browser javascript console. Example using Google Chrome v29 in OS X 10.9:

	>> paella.utils.userAgent.broser
	Object {Version: Object, Safari: false, Chrome: true, Name: "Chrome", Vendor: "Google"…}
		Chrome: true
		Explorer: false
		Firefox: false
		IsMobileVersion: false
		Name: "Chrome"
		Opera: false
		Safari: false
		Vendor: "Google"
		Version: Object
			major: 29
			minor: 0
			revision: 1547
			versionString: "29.0.1547.76"
	>> paella.utils.userAgent.system
	Object {MacOS: true, Windows: false, iPhone: false, iPodTouch: false, iPad: false…}
		Android: false
		Linux: false
		MacOS: true
		OSName: "Mac OS X"
		Version: Object
			major: 10
			minor: 9
			revision: 0
			stringValue: "10.9.0"
		Windows: false
		iOS: false
		iPad: false
		iPhone: false
		iPodTouch: false

