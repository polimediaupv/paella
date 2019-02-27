---
---

# Play button on the video area

This plugin adds the central play icon in the video container, and it's an example of an event driven plugin. To create an event driven plugin, extend the paella.EventDrivenPlugin class:

```javascript

paella.addPlugin(function() {
	return class PlayButtonOnScreen extends paella.EventDrivenPlugin {
		...
```

Overriding the `getEvents()` method, you tell the event manager which events you want to listen:

```javascript
		...

		getEvents() {
			return [
				paella.events.endVideo,
				paella.events.play,
				paella.events.pause
			];
		}

		...
```

When one of these events occurs, the event manager will call the `onEvent()` function, passing the event type and the parameters:

```javascript
		onEvent(eventType,params) {
			switch (eventType) {
				case paella.events.endVideo:
					this.endVideo();
					break;
				case paella.events.play:
					this.play();
					break;
				case paella.events.pause:
					this.pause();
					break;
				case paella.events.showEditor:
					this.showEditor();
					break;
				case paella.events.hideEditor:
					this.hideEditor();
					break;
			}
		}
```

