package paella {
	public interface IMediaElement {

		function play():void;

		function pause():void;

		function stop():void;
		
		function setSize(width:Number, height:Number):void;

		function setCurrentTime(pos:Number):void;

		function setVolume(vol:Number):void;
		
		function getVolume():Number;

		function setMuted(muted:Boolean):void;

		function duration():Number;

		function currentTime():Number;
		
		function currentProgress():Number;
		
		function get videoWidth():Number;
		
		function get videoHeight():Number;
		
	}
}