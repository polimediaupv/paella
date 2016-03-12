# Button plugin example
## es.upv.paella.playPauseButtonPlugin

### Creation: extend paella.ButtonPlugin
Generally, to create a plugin, the first step is create a new class that extends paella.Plugin. In this
case, to create a button plugin, use paella.ButtonPlugin as superclass. It's important to create an unique
name to identify your plugin, to do it, simply overwrite the getName() function.

	Class ("paella.plugins.PlayPauseButtonPlugin",paella.ButtonPlugin, {
		getName:function() { return "es.upv.paella.playPauseButtonPlugin"; },

### Setup:
The setup is performed in two steps:

1. Check if the plugin is enabled or not. Call onSuccess passing true if the plugin may be enabled or
false if not. This function is used to determine if the plugin may be loaded programmatically, but there is
also another way to enable or disable a plugin using the config.json file, in the 'plugin' section. If a
plugin is not enabled in the config.json file, the checkEnabled() function will not be called. 

		checkEnabled:function(onSuccess) {
			onSuccess(!paella.player.isLiveStream());
		},

2. Setup the plugin. The plugin manager will call tye setup() function if the plugin is enabled.

		setup:function() {
			var This = this;
			if (paella.player.playing()) {
				this.changeSubclass(This.pauseSubclass);
			}
			// Register play and pause events to update the button status
			paella.events.bind(paella.events.play,function(event) { This.changeSubclass(This.pauseSubclass); This.setToolTip(paella.dictionary.translate("Pause"));});
			paella.events.bind(paella.events.pause,function(event) { This.changeSubclass(This.playSubclass); This.setToolTip(paella.dictionary.translate("Play"));});
		},

### Button position in playback bar: getAlignment(), getIndex()
The position of the button in the playback bar can be configured overwriting the getAlignment() and getIndex()
functions. getAlignment() may return 'left' or 'right', and this values will determine if the button is placed
in the left side or in the right side of the playback bar.

getIndex() will determine the loading order. A plugin with a lower index will be loaded before other with a greater index.

		// Returns left or right, depending on the button position relative to the playback bar
		getAlignment:function() { return 'left'; },
		
		// The plugins will be loaded order by this index
		getIndex:function() {return 110;},
		

### Execute plugin action
The action() function will be called when the user press the button. This function receive the button
dom element as parameter 

		// This function will be called when the user press the button
		action:function(button) {
			paella.player.videoContainer.paused()
				.done(function(paused) {
					if (paused) {
						paella.player.play();
					}
					else {
						paella.player.pause();
					}
				});
		}
	});		// End of the class definition

### Instantiate the plugin
Finally, to register the plugin in Paella Player's plugin manager, create a new instance of the plugin. Its a 
common practice to assign the instance to a variable with the same name as the plugin class, changing the first
letter to lowercase

	paella.plugins.playPauseButtonPlugn = new paella.plugins.PlayPauseButtonPlugin();
