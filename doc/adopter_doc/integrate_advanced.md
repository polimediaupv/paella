# Integrate Paella in your portal: the advanced way

To integrate Paella Player in your portal, you must to suply a series of data about the video streams and the user account. 
Some of these data are optional, but if aren't supplied is possible that some features are disabled.

The basic data is supplied by implementing the classes paella.AccessControl and paella.VideoLoader, and passing an instance of both of them to the paella.initDelegate:

Paella Player:

``` js
function loadPaella(containerId) {
	var initDelegate = new paella.InitDelegate({
		accessControl:new MyAccessControl(),
		videoLoader:new MyVideoLoader()
	});

	initPaellaEngage(containerId,initDelegate);
}
```


## User login, data and permissions: paella.AccessControl

1. Extend paella.AccessControl and implement the checkAccess method:
 
	``` js
	var MyAccessControl = Class.create(paella.AccessControl,{
		checkAccess:function(onSuccess) {		
	```

2. Fill-in the this.permissions object, specifying the privileges that the current user have. You can get this data asynchronously if you want, because Paella Player will be waiting until you call the onSuccess callback. There are two objects that you must to fill-in: permissions and userData:

	``` js
	this.permissions.canRead = true;
	this.permissions.canWrite = true;
	this.permissions.canContribute = true;
	this.permissions.loadError = false;
	this.permissions.isAnonymous = true;
	
	this.userData.login = 'anonymous';
	this.userData.name = 'Anonymous';
	this.userData.avatar = 'resources/images/default_avatar.png';
	```

3. Call onSuccess when you end loading all the data, and pass the permissions and userData objects to it:

	``` js
			onSuccess(this.permissions,this.userData);
		}
	});
	```
 


## Video data: paella.VideoLoader

1. Extend paella.VideoLoader and implement the loadVideo function:
 
	``` js
	var MyVideoLoader = Class.create(paella.VideoLoader, {
		loadVideo:function(videoId,onSuccess) {		
	```

2. Setup the video stream data:

	``` js
	var url = videoId;
	if (url) {
		var stream = examplePresenterSources;	// See below
		stream.sources.mp4[0].src = url + stream.sources.mp4[0].src;
		stream.preview = url + stream.preview;
		this.streams.push(stream);
	
		stream = exampleSlidesSources;			// See below
		stream.sources.mp4[0].src = url + stream.sources.mp4[0].src;
		stream.preview = url + stream.preview;
		for (var key in stream.sources.image.frames) {
			stream.sources.image.frames[key] = url + stream.sources.image.frames[key];
		}
	this.streams.push(stream);
	```		

3. Setup the video thumbnails:
 
	``` js
		this.frameList = exampleFrameList;	// See below
		for (var key in this.frameList) {
			this.frameList[key].url = url + this.frameList[key].url;
			this.frameList[key].thumb = url + this.frameList[key].thumb;
		}
	}
	```

4. Set this.loadStatus = true if all went Ok and call onSuccess:
 
	``` js
			// Callback
			this.loadStatus = true;
			onSuccess();
		}
	}
	```

## Video and frame thumnail data

Paella Player supports one or multiple video streams (but it only can play up to two streams at the same time). It also support several video formats. If you want to take advantage of this features, you must to supply all this data. You can add the stream data in the loadVideo function using the this.streams array:

``` js
	this.streams.push(myStreamInfo)
```

The first stream will be the master stream (presenter video), the second stream will be the slave (slides video), and all the other streams will be ignored, but you can implement plugins to use them:

``` js
myStreamInfo: {
	// mp4 video source
	mp4:[
		{ src:'/presentation.mp4', type:"video/mp4", res:{w:1024,h:768} },	// 1024x768 video
		{ src:'/presentation2.mp4', type:"video/mp4", res:{w:640,h:480} }	// 640x480 video
	],
	// ogg video sourve
	ogg:[
		{ src:'/presentation.ogv', type:"video/ogg", res:{w:1024,h:768} },	// 1024x768 video
		{ src:'/presentation2.mp4', type:"video/ogg", res:{w:640,h:480} }	// 640x480 video
	],
	// flv video sourve
	flv:[
		{ src:'/presentation.flv', type:"video/x-flv", res:{w:1024,h:768} },	// 1024x768 video
		{ src:'/presentation2.flv', type:"video/x-flv", res:{w:640,h:480} }	// 640x480 video
	],
	// rtmp stream
	rtmp:[
		{src:"rtmp://server.com/endpoint/url1.mp4",type="video/mp4 | video/x-flv", res:{w:1024,h:768} },
		{src:"rtmp://server.com/endpoint/url2.mp4",type="video/mp4 | video/x-flv", res:{w:640,h:480} }
	],
	// Images video:
	image:[ {
		frames:{
			frame_0:'/image/frame_0.jpg',
			frame_8:'/image/frame_8.jpg',
			frame_24:'/image/frame_24.jpg',
			frame_48:'/image/frame_48.jpg',
			frame_67:'/image/frame_67.jpg',
			frame_79:'/image/frame_79.jpg',
			frame_145:'/image/frame_145.jpg',
			frame_204:'/image/frame_204.jpg',
			frame_275:'/image/frame_275.jpg',
			frame_314:'/image/frame_314.jpg',
			frame_333:'/image/frame_333.jpg',
			frame_352:'/image/frame_352.jpg',
			frame_382:'/image/frame_382.jpg',
			frame_419:'/image/frame_419.jpg',
			frame_464:'/image/frame_464.jpg',
			frame_496:'/image/frame_496.jpg',
			frame_505:'/image/frame_505.jpg',
			frame_512:'/image/frame_512.jpg',
			frame_521:'/image/frame_521.jpg',
			frame_542:'/image/frame_542.jpg',
			frame_585:'/image/frame_585.jpg',
			frame_593:'/image/frame_593.jpg',
			frame_599:'/image/frame_599.jpg',
			frame_612:'/image/frame_612.jpg',
			frame_613:'/image/frame_613.jpg',
			frame_658:'/image/frame_658.jpg'
		},
		type:"image/jpeg",
		duration:928,
		res:{w:1024,h:768}
	} ]
}
```

## Other data: paella.Data

### paella.Data

Provides with a homogeneous mechanism to write and read persistent data. paella.Data is implemented based on the Delegate design pattern. It delegates the reading and writting operations on an object that knows where read from and write to data. To setup the delegate objects, you must to implement them and use the paella player's `config.json` file to register them.

``` js
paella.data.write("myContext","key",{data:"my data"},function(response,status) {
	if (status) console.log("data successfully writted");
	else console.log("error writting data");
});

paella.data.read("myContext","key",function(data) {
	console.log(data);
});
```

### paella.DataDelegate

To write and read data to and from your server, you must to implement your specific dataDelegates and register them in your config.json file:

Example: cookie-based reader and writter delegate

``` js
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
```

Register cookie data delegate in config.json

``` js
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
````

Each context is related with a service that your server can provide. This contexts usually are handled 
by different plugins: for example, the "annotations" service is handled by the Paella Player Annotations
plugin, to show annotations in the video canvas, and also are handled by the Paella Editor Annotation
plugin to create and modify annotations. In a particular case, the server may supply these annotations
by using files, and in other case may supply them using a REST API. The way in wich you must to implement
your DataDelegate class will depend on the way your server provide the data.

The data format that you will receive and send in your DataDelegate will depend on the particular context: 
for example, the "captions" context may expect a format, and the "annotations" context may expect a
different one. Refer to the specific context documentation to know more about its data format.
