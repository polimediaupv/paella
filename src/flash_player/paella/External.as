package paella {

import flash.external.ExternalInterface;


public class External {
	public static function get available():Boolean {
		return flash.external.ExternalInterface.available;
	}

	public static function get objectID():String {
		return flash.external.ExternalInterface.objectID.toString();
	}
	
	public static function addCallback(functionName:String, closure:Function):void {
		if (flash.external.ExternalInterface.available) {
			flash.external.ExternalInterface.addCallback(functionName,closure);
		}
	}
	
	public static function call(functionName:String, ... arguments):void {
		if (flash.external.ExternalInterface.available) {
			flash.external.ExternalInterface.call(functionName,arguments);
		}
	}
}

}
