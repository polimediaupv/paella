
package paella {
import flash.net.NetStream;
import flash.net.NetConnection;

public dynamic class DynamicNetStream extends NetStream {
	public function DynamicNetStream(connection:NetConnection) {
		super(connection);
	}
}
}