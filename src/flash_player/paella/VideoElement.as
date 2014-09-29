package paella {
	
import flash.display.Sprite;
import flash.events.*;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.media.Video;
import flash.media.SoundTransform;
import flash.utils.Timer;

public class VideoElement extends Sprite implements IMediaElement {
	private var _javascriptInterface:JavascriptInterface;
	
	private var _currentUrl:String = "";
	private var _preload:String = "";
	private var _isPreloading:Boolean = false;
	
	private var _connection:NetConnection;
	private var _streams:NetStream;
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

    private var _bytesLoaded:Number = 0;
    private var _bytesTotal:Number = 0;
    private var _bufferedTime:Number = 0;
    private var _bufferEmpty:Boolean = false;
    private var _bufferingChanged:Boolean = false;
    private var _seekOffset:Number = 0;


    private var _videoWidth:Number = -1;
    private var _videoHeight:Number = -1;

    private var _timer:Timer;

    private var _isRTMP:Boolean = false;
    private var _streamer:String = "";
    private var _isConnected:Boolean = false;
    private var _playWhenConnected:Boolean = false;
    private var _hasStartedPlaying:Boolean = false;

    private var _parentReference:Object;
    private var _pseudoStreamingEnabled:Boolean = false;
    private var _pseudoStreamingStartQueryParam:String = "start";
	
    public function setReference(arg:Object):void { _parentReference = arg; }
	public function setSize(width:Number, height:Number):void { _video.width = width; _video.height = height; }
    public function setPseudoStreaming(enablePseudoStreaming:Boolean):void { _pseudoStreamingEnabled = enablePseudoStreaming; }
    public function setPseudoStreamingStartParam(pseudoStreamingStartQueryParam:String):void { _pseudoStreamingStartQueryParam = pseudoStreamingStartQueryParam; }
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
			if (_pseudoStreamingEnabled) {
				currentTime += _seekOffset;
			}
		}
	    return currentTime;
	}
	
    public function VideoElement(jsInterface:JavascriptInterface, autoplay:Boolean, preload:String, timerRate:Number, startVolume:Number, streamer:String) {
		_javascriptInterface = jsInterface;
		_autoplay = autoplay;
		_volume = startVolume;
		_preload = preload;
		_streamer = streamer;

		_video = new Video();
		addChild(_video);

		_connection = new NetConnection();
		_connection.client = { onBWDone: function():void{} };
		_connection.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
		_connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);

		_timer = new Timer(timerRate);
		_timer.addEventListener("timer", timerHandler);
    }
	
	private function timerHandler(e:TimerEvent):void {
		_bytesLoaded = _stream.bytesLoaded;
	    _bytesTotal = _stream.bytesTotal;

	    if (!_isPaused) {
			sendEvent(HtmlMediaEvent.TIMEUPDATE);
	    }
		
	    if (_bytesLoaded < _bytesTotal) {
	    	sendEvent(HtmlMediaEvent.PROGRESS);
	    }
	}
	
	private function netStatusHandler(event:NetStatusEvent):void {
	    trace("netStatus", event.info.code);

	    switch (event.info.code) {

	      case "NetStream.Buffer.Empty":
	        _bufferEmpty = true;
	        _isEnded ? sendEvent(HtmlMediaEvent.ENDED) : null;
	        break;

	      case "NetStream.Buffer.Full":
	        _bytesLoaded = _stream.bytesLoaded;
	        _bytesTotal = _stream.bytesTotal;
	        _bufferEmpty = false;

	        sendEvent(HtmlMediaEvent.PROGRESS);
	        break;

	      case "NetConnection.Connect.Success":
	        connectStream();
			sendEvent(HtmlMediaEvent.LOADEDDATA);
	        sendEvent(HtmlMediaEvent.CANPLAY);
	        break;
	      case "NetStream.Play.StreamNotFound":
	        trace("Unable to locate video");
	        break;

	      // STREAM
	      case "NetStream.Play.Start":

	        _isPaused = false;
	        sendEvent(HtmlMediaEvent.LOADEDDATA);
	        sendEvent(HtmlMediaEvent.CANPLAY);

	        if (!_isPreloading) {

	          sendEvent(HtmlMediaEvent.PLAY);
	          sendEvent(HtmlMediaEvent.PLAYING);

	        }

	        _timer.start();

	        break;

	      case "NetStream.Seek.Notify":
	        sendEvent(HtmlMediaEvent.SEEKED);
	        break;

	      case "NetStream.Pause.Notify":
	        _isPaused = true;
	        sendEvent(HtmlMediaEvent.PAUSE);
	        break;

	      case "NetStream.Play.Stop":
	        _isEnded = true;
	        _isPaused = false;
	        _timer.stop();
	        _bufferEmpty ? sendEvent(HtmlMediaEvent.ENDED) : null;
	        break;

	    }
	}
	
	private function securityErrorHandler(event:SecurityErrorEvent):void {
	}

	private function asyncErrorHandler(event:AsyncErrorEvent):void {
	}
	
	private function onMetaDataHandler(info:Object):void {
	}
	
	
	// IMediaElement
	public function setSrc(url:String):void {
	}
	
	public function load():void {
	}
	
	public function connectStream():void {
	}
	
	public function play():void {
	}
	
	public function pause():void {
	}
	
	public function stop():void {
	}
	
	public function setCurrenTime(pos:Number):void {
	}
	
	public function setVolume(volume:Number):void {
	}
	
	public function getVolume():Number {
	}
	
	public function setMuted(muted:Boolean):void {
	}
	
	private function sendEvent(eventName:String):void {
	}
	
	private function parseRTMP(url:String):Object {
	}
	
	private function getCurrentUrl(pos:Number):String {
	}
}

}
