
export default {
	PLAY: "paella:play",
	PAUSE: "paella:pause",
	ENDED: "paella:ended",
	SEEK: "paella:seek",
	FULLSCREEN: "paella:fullscreen",
	VOLUME_CHANGED: "paella:volumeChanged",
	TIMEUPDATE: "paella:timeupdate"
};

export function bindEvent(player, event, callback) {
	player.__eventListeners__ = player.__eventListeners__ || {};
	player.__eventListeners__[event] = player.__eventListeners__[event] || [];
	player.__eventListeners__[event].push(callback);
	return callback;
}

export function triggerEvent(player, event, params = {}) {
	player.__eventListeners__ &&
	player.__eventListeners__[event] &&
	player.__eventListeners__[event].forEach(cb => cb(params));
}
