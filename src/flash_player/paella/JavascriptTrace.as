
package paella {

import flash.external.ExternalInterface;

public class JavascriptTrace {
	public static function log(message:String):void {
		if (paella.External.available) {
			paella.External.call("base.log.log", message);
		}
		else {
			trace(message);
		}
	}
	
	public static function error(message:String):void {
		if (paella.External.available) {
			paella.External.call("base.log.error", message);
		}
		else {
			trace(message);
		}
	}
	
	public static function warning(message:String):void {
		if (paella.External.available) {
			paella.External.call("base.log.warning", message);
		}
		else {
			trace(message);
		}
	}
	
	public static function debug(message:String):void {
		if (paella.External.available) {
			paella.External.call("base.log.debug", message);
		}
		else {
			trace(message);
		}
	}
}

}