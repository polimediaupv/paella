package paella {
	
import flash.display.Sprite;
import flash.events.*;
import paella.DynamicNetStream;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.media.Video;
import flash.media.SoundTransform;
import flash.utils.Timer;

public class VideoElement extends Sprite implements IMediaElement {
	private var _javascriptInterface:JavascriptInterface;
	
	private var _url:String = "";
	private var _streamServer:String = "";
	private var _streamResource:String = "";
    private var _isRTMP:Boolean = false;
    private var _canPlay:Boolean = false;
	private var _playReady:Boolean = false;
	
	private var _autoplay:Boolean = true;
	
	private var _connection:NetConnection;
	private var _stream:NetStream;
	private var _video:Video;
	private var _soundTransform:SoundTransform;
	private var _oldVolume:Number = 1;
	
	// event values
    private var _duration:Number = 0;
    private var _framerate:Number;
    private var _isPaused:Boolean = true;
    private var _isEnded:Boolean = false;
    private var _volume:Number = 1;
    private var _isMuted:Boolean = false;

	private var _bufferTime:Number = 1;
    private var _bytesLoaded:Number = 0;
    private var _bytesTotal:Number = 0;
    private var _bufferedTime:Number = 0;
    private var _bufferEmpty:Boolean = false;
    private var _bufferingChanged:Boolean = false;
    private var _seekOffset:Number = 0;


    private var _videoWidth:Number = -1;
    private var _videoHeight:Number = -1;

    private var _timer:Timer;

    private var _parentReference:Object;
	
    public function setReference(arg:Object):void { _parentReference = arg; }
	public function setSize(width:Number, height:Number):void { _video.width = width; _video.height = height; }
 	public function get video():Video { return _video; }
	public function get videoHeight():Number { return _videoHeight; }
	public function get videoWidth():Number { return _videoWidth; }
	public function duration():Number { return _duration; }
	
	public function currentProgress():Number {
		if(_stream != null) {
			return Math.round(_stream.bytesLoaded/_stream.bytesTotal*100);
	    } else {
			return 0;
	    }
	}
	
	public function currentTime():Number {
		var currentTime:Number = 0;
	    if (_stream != null) {
			currentTime = _stream.time;
		}
	    return currentTime;
	}

    public function VideoElement(jsInterface:JavascriptInterface, url:String, autoplay:Boolean, startVolume:Number, bufferTime:Number) {
		_javascriptInterface = jsInterface;
		_bufferTime = bufferTime;
		
		_autoplay = autoplay;
		_volume = startVolume;

		if (_autoplay) {
			JavascriptTrace.debug("Autoplay");
		}

		_video = new Video();
		_video.smoothing = true;
		addChild(_video);
		
		loadUrl(url);

		NetConnection.prototype.onBWDone = function(p_bw) {
			JavascriptTrace.debug("onBWDone: "+p_bw);
		}
		_connection = new NetConnection();
		
		_connection.client = { onBWDone: function():void{} };
		_connection.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
		_connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
		_connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler)

		_timer = new Timer(150);
		_timer.addEventListener("timer", timerHandler);
		_timer.start();
		
		connect();
    }
	
	protected function loadUrl(url:String) {
		var protocolPattern:RegExp = /^\w+(?=:\/\/)/;
		var domainWithOptionalProtocol:RegExp = /^(\w+:\/\/)?[\w+.]+(?=(\/|:\d+))/;
		var portNumberPattern:RegExp = /(?<=\:)\d+(?=\/)/g;
		
		var proto:String = url.match(protocolPattern)[0];
		var server:String = url.match(domainWithOptionalProtocol)[0];
		var port:String = url.match(portNumberPattern)[0];
		if (port) server += ":" + port;
		server += "/";
		var directories:String = url.replace(server,"");
		
		if (url.match(/^rtmp(s|t|e|te)?\:\/\//)) {
			_isRTMP = true;
			var match:Array = url.match(/(.*)\/((flv|mp4|mp3):.*)/);

			if (match) {
				_streamServer = match[1];
				_streamResource = match[2];
			}
			else {
				//var server:String = URLUtil.getServerNameWithPort(url);
				_streamServer = server + directories.split('/')[0];
				_streamResource = url.replace(_streamServer,"");
			}
			
			JavascriptTrace.debug("RTMP stream detected: ");
			JavascriptTrace.debug("server: " + _streamServer);
			JavascriptTrace.debug("resource: " + _streamResource);
		}
		else {
			_isRTMP = false;
			_url = url;
		}
	}
	
	public function set bufferTime(time:Number):void {
		_bufferTime = time;
	}
	
	public function get bufferTime():Number {
		return _bufferTime;
	}
	
	private function timerHandler(e:TimerEvent):void {
		if (_stream) {
			_bufferedTime = _stream.bytesLoaded;
			_bytesLoaded = _stream.bytesLoaded;
		    _bytesTotal = _stream.bytesTotal;
			if (!_isPaused) {
				sendEvent(HtmlEvent.TIMEUPDATE);
			}

		    if (_bytesLoaded < _bytesTotal && !_isRTMP) {
		    	sendEvent(HtmlEvent.PROGRESS);
		    }
		}
	}
	
	private function netStatusHandler(event:NetStatusEvent):void {
		switch (event.info.code) {
			case "NetStream.Buffer.Empty":
				_bufferEmpty = true;
				stop();
				_isEnded ? sendEvent(HtmlEvent.ENDED) : null;
				break;

			case "NetStream.Buffer.Full":
				_bytesLoaded = _stream.bytesLoaded;
				_bytesTotal = _stream.bytesTotal;
				_bufferEmpty = false;
				sendEvent(HtmlEvent.PROGRESS);
				break;

			case "NetConnection.Connect.Success":
				createNetStream();
				break;
			case "NetConnection.Connect.Closed":
				JavascriptTrace.debug("Connection closed");
				break;
			case "NetStream.Play.StreamNotFound":
				JavascriptTrace.error("Unable to locate video:" + _streamResource);
				break;
		}
	}
	
	private function securityErrorHandler(event:SecurityErrorEvent):void {
		JavascriptTrace.error("Security error: " + event);
	}

	private function asyncErrorHandler(event:AsyncErrorEvent):void {
		JavascriptTrace.error("Async error: " + event);
	}
	
	public function metaDataHandler(info:Object):void {
		JavascriptTrace.debug("Metadata loaded");
		_duration = info.duration;
	    _framerate = info.framerate;
	    _videoWidth = info.width;
	    _videoHeight = info.height;
		_canPlay = true;
		
		JavascriptTrace.debug("Duration: " + _duration);
		JavascriptTrace.debug("Frame rate: " + _framerate);
		JavascriptTrace.debug("Size: " + _videoWidth + "x" + _videoHeight);

	    // set size?
		sendEvent(HtmlEvent.LOADEDDATA);
		sendEvent(HtmlEvent.CANPLAY);
	    sendEvent(HtmlEvent.LOADEDMETADATA);
		sendEvent(HtmlEvent.PROGRESS);
		sendEvent(HtmlEvent.TIMEUPDATE);
		
		if (!_autoplay) {
			pause();
		}
		_autoplay = true;
	}
	
	public function cuePointHandler(info:Object):void {
		
	}
	
	public function onBWDone(oObject1:Object):void	{
		JavascriptTrace.debug("onBWDone");
	}
	
	protected function connect():void {
		if (_isRTMP) {
			JavascriptTrace.debug("Connecting to RTMP server: " + _streamServer);
			_connection.connect(_streamServer);
		}
		else {
			_connection.connect(null);
		}
	}
	
	protected function createNetStream() {
		if (_connection.connected) {
			JavascriptTrace.debug("Connected");
			_stream = new DynamicNetStream(_connection);
			_video.attachNetStream(_stream);
			_stream.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler, false, 0, true);
			_stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler, false, 0, true);
			_stream.bufferTime = _bufferTime;
			_stream.client = {};
			_stream.client.onBWDone = onBWDone;
			_stream.client.onMetaData = metaDataHandler;
			_stream.client.onCuePoint = cuePointHandler;
			_soundTransform = new SoundTransform();
			
			play();
		}
	}
	
	public function play():void {
		if (_stream && !_playReady) {
			if (_isRTMP) {
				JavascriptTrace.debug("Playing stream: " + _streamResource);
				_stream.play(_streamResource);
			}
			else {
				JavascriptTrace.debug("Playing stream: " + _url);
				_stream.play(_url);
			}
			_isPaused = false;
			_playReady = true;
			sendEvent(HtmlEvent.PLAY);
			sendEvent(HtmlEvent.PLAYING);
		}
		else if (_stream && _playReady && _isPaused) {
			JavascriptTrace.debug("Resume play");
			_stream.resume();
			_isPaused = false;
			sendEvent(HtmlEvent.PLAY);
			sendEvent(HtmlEvent.PLAYING);
		}
		else if (!_stream) {
			createNetStream();
			play();
		}
	}
	
	public function pause():void {
		if (!_isPaused && _playReady) {
			if (_stream!=null) _stream.pause();
			_isPaused = true;
			sendEvent(HtmlEvent.PAUSE);
		}
	}
	
	public function stop():void {
		JavascriptTrace.debug("Stop");
	    if (_stream == null)
	     	return;
		_stream.close();
		_stream = null;
		_playReady = false;
		_isPaused = true;

	    sendEvent(HtmlEvent.STOP);
	}
	
	public function setCurrentTime(pos:Number):void {
		if (_stream == null) {
			return;
		}
		_stream.seek(pos);
		sendEvent(HtmlEvent.SEEKING);
	}
	
	public function setVolume(volume:Number):void {
		if (_stream != null) {
			_soundTransform = new SoundTransform(volume);
			_stream.soundTransform = _soundTransform;
		}

		_volume = volume;

		_isMuted = (_volume == 0);

		sendEvent(HtmlEvent.VOLUMECHANGE);
	}
	
	public function getVolume():Number {
	    if(_isMuted) {
	     	return 0;
	    }
		else {
	    	return _volume;
	    }
	}
	
	public function setMuted(muted:Boolean):void {
		if (_isMuted == muted)
			return;

		if (muted) {
			_oldVolume = (_stream == null) ? _oldVolume : _stream.soundTransform.volume;
			setVolume(0);
		}
		else {
			setVolume(_oldVolume);
		}

		_isMuted = muted;
	}
	
	private function sendEvent(eventName:String):void {
		// calculate this to mimic HTML5
		_bufferedTime = _bytesLoaded / _bytesTotal * _duration;
		if (!_isRTMP) {
			JavascriptTrace.debug(eventName + " - buffered time: " + _bufferedTime + ", current time: " + currentTime());
		}
		else {
			JavascriptTrace.debug(eventName + " - current time: " + currentTime());
		}
		

		// build JSON
		var values:String =
			"duration:" + _duration +
			",framerate:" + _framerate +
			",currentTime:" + currentTime() +
			",muted:" + _isMuted +
			",paused:" + _isPaused +
			",ended:" + _isEnded +
			",volume:" + _volume +
			",src:\"" + _url + "\"" +
			",bytesTotal:" + _bytesTotal +
			",bufferedBytes:" + _bytesLoaded +
			",bufferedTime:" + _bufferedTime +
			",videoWidth:" + _videoWidth +
			",videoHeight:" + _videoHeight +
			"";

		_javascriptInterface.sendEvent(eventName, values);
	}
	
	private function getCurrentUrl():String {
	    return _url;
	}
}

}
