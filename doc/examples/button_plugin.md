---
---

# Button plugin example

## es.upv.paella.playPauseButtonPlugin

### Creation: extend paella.ButtonPlugin

To create a plugin, the first step is create a new class that extends paella.Plugin. In this case, to create a button plugin, use paella.ButtonPlugin as superclass.

The new plugin class is registered using `paella.addPlugin()` function, that receives a closure. That closure will be invoqued during the player loading process, y debe devolver la clase que implementa el plugin.

It's important to create an unique name to identify your plugin, to do it, simply overwrite the getName() function.

```javascript
paella.addPlugin(function() {
	return class PlayPauseButtonPlugin extends paella.ButtonPlugin {

		...

		getName() { return "es.upv.paella.playPauseButtonPlugin"; }
```

### Setup

The setup is performed in two steps:

1. Check if the plugin is enabled or not. Call onSuccess passing true if the plugin may be enabled or false if not. This function is used to determine if the plugin may be loaded programmatically, but there is also another way to enable or disable a plugin using the `config.json` file, in the `plugin` section. If a plugin is not enabled in the config.json file, the checkEnabled() function will not be called.

```javascript
checkEnabled(onSuccess) {
  onSuccess(true);
}
```

2. Setup the plugin. The plugin manager will call tye setup() function if the plugin is enabled.

```javascript
setup() {	
  if (paella.player.playing()) {
    this.changeIconClass(this.playIconClass);
  }

  paella.events.bind(paella.events.play,(event) => {
    this.changeIconClass(this.pauseIconClass);
    this.changeSubclass(this.pauseSubclass);
    this.setToolTip(paella.utils.dictionary.translate("Pause"));
  });
  
  paella.events.bind(paella.events.pause,(event) => {
    this.changeIconClass(this.playIconClass);
    this.changeSubclass(this.playSubclass);
    this.setToolTip(paella.utils.dictionary.translate("Play"));
  });
}
```

### Button position in playback bar: getAlignment(), getIndex()

The position of the button in the playback bar can be configured overwriting the `getAlignment()` and `getIndex()` functions. `getAlignment()` may return `left` or `right`, and this values will determine if the button is placed
in the left side or in the right side of the playback bar.

`getIndex()` will determine the loading order. A plugin with a lower index will be loaded before other with a greater index.

```javascript
getAlignment() { return 'left'; }
getIndex() { return 110; }
```

### Other plugin settings

`getSubclass()` returns the plugin CSS subclass to build the DOM node.

`getIconClass()` returns the CSS icon class, to select the icon to use (see [skining paella player](../adopters/skining.md)).

`getDefaultToolTip()` returns a descriptive tooltip that will appear when the mouse cursor is held over the button for a few seconds.

`getAriaLabel()` returns the accesibility ARIA label. If the button does not provide a valid ARIA label, will be inaccesible for the tabulator navigation. You should be careful not to set ARIA tags on those plugins that may be irrelevant to visually impaired people. You can skip the implementation of this function by setting the `ariaLabel` attribute in the plugin configuration, inside the `config.json` file.

```javascript

getSubclass() { return this.playSubclass; }
getIconClass() { return this.playIconClass; }
getDefaultToolTip() { return paella.utils.dictionary.translate("Play"); }

// Play/pause accesibility provided via spacebar key
getAriaLabel() { return null; }

```

### Execute plugin action

The action() function will be called when the user press the button. This function receive the button
dom element as parameter

```javascript
action(button) {
  paella.player.videoContainer.paused()
    .then(function(paused) {
      if (paused) {
      	paella.player.play();
      }
      else {
      	paella.player.pause();
      }
    });
  }
});	// End of the class definition
```
