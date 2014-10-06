
package paella {

import flash.external.ExternalInterface;
import flash.text.*;

public class JavascriptTrace {
	public static var debugText:TextField = null;

	public static function log(message:String):void {
		debugToCanvas('LOG:' + message);
		if (paella.External.available) {
			paella.External.call("base.log.log", message);
		}
		else {
			trace(message);
		}
	}
	
	public static function error(message:String):void {
		debugToCanvas('ERROR:' + message);
		if (paella.External.available) {
			paella.External.call("base.log.error", message);
		}
		else {
			trace(message);
		}
	}
	
	public static function warning(message:String):void {
		debugToCanvas('WARNING:' + message);
		if (paella.External.available) {
			paella.External.call("base.log.warning", message);
		}
		else {
			trace(message);
		}
	}
	
	public static function debug(message:String):void {
		debugToCanvas('DEBUG:' + message);
		if (paella.External.available) {
			paella.External.call("base.log.debug", message);
		}
		else {
			trace(message);
		}
	}
	
	private static function debugToCanvas(message:String):void {
		if (debugText) {
			debugText.appendText("\n" + message);
			debugText.scrollV = debugText.maxScrollV;
		}
	}
}

}