import PlayerResource from 'paella/core/PlayerResource';
import { getVideoPlugin } from 'paella/core/VideoPlugin';

export default class SteramProvider extends PlayerResource {
	constructor(player, videoContainer) {
		super(player, videoContainer);
		this._videoContainer = videoContainer;
		this._streamData = null;
		this._streams = null;
		this._players = [];
	}
	
	async load(streamData) {
		this._streamData = streamData;
		this._streams = {};
		
		console.debug("Finding compatible video plugins");
		
		// Find video plugins for each stream
		this._streamData.forEach(stream => {
			const videoPlugin = getVideoPlugin(this.player, stream);
			if (!videoPlugin) {
				throw Error(`Incompatible stream type: ${ stream.content }`);
			}
			
			this._streams[stream.content] = {
				stream,
				videoPlugin
			}
		})
		
		for (const content in this._streams) {
			const s = this._streams[content];
			s.player = await s.videoPlugin.getVideoInstance(this._videoContainer);
			await s.player.load(s.stream);
			this._players.push(s.player);
		}
	}
	
	get players() {
		return this._players;
	}
	
	// This is the raw streamData loaded from the video manifest
	get streamData() {
		return this._streamData;
	}
	
	// This property stores the available streams, indexed by the content identifier, and contains the
	// stream data, the video plugin and the player, for each content identifier.
	get streams() {
		return this._streams;
	}
}