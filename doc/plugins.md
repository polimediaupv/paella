# Plugins readme #

## Create a new plugin

A plugin is a subclass of any child class of paella.Plugin. To create a plugin, we'll extend any of these classes, depending on the new feature we want to add to Paella Player. The functions that you'll need to implement, will depend on the specific plugin type and configuration, and will be discussed later.


By convention, the new plugin classes will be placed into the "paella.plugins" namespace.



	paella.plugins.MyNewPlugin = Class.create(paella.[Any paella.Plugin Subclass],{
		// plugin implementation
	});


Inmediately after the plugin implementation, we must to instantiate it. By convention, the plugin instance variable will be placed in the same namespace as its class, and with the same name as the class, starting with a lower case character.


	paella.plugins.myNewPlugin = new paella.plugins.MyNewPlugin()



## Plugin life cycle

The plugin life cycle starts with it's instantiation. After that, Paella Player loads all its resources and triggers the `paella.events.loadPlugins` event.

The Paella Player's plugin architecture is extensible: you can create new plugin types by registering your plugin handler in the paella.PluginManager object. When Paella Player triggers the `paella.events.loadPlugins` event, all the plugin handlers will load the plugins that they known how to treat. The plugin life cycle is slightly different depending on the plugin's type, but basically can be categorized as follows:

1. instantiate: you create the new instance of your plugin. In this moment, the plugin registers itself in the plugin manager object. It's very important to not override the plugin's constructor, and if you do it, it's essential to call the parent constructor to correctly register the plugin.

2. Paella Player triggers the paella.events.loadPlugins when all resources are loaded (string dictionaries, video streams, access control and video data and other video resources)

3. Plugin order: all plugins are ordered by it's index. The plugin's index is an integer number that specify the order in wich the different plugins will be loaded: the lower is the plugin's index, the sooner will be loaded.

4. Check enable status: the plugin's handler checks if the plugin is or is not enabled. If the plugin is not enabled, it's life cycle ends here: a plugin can not be enabled afther this point.

5. Setup the plugin: the plugin's handler call the plugin's setup method. If you need to perform some initialization in your plugin, this is the prefered place to do it, not the constructor.

6. Specific plugin life cycle: from this point, each plugin will perform its specific life cycle operations.



## Player plugins ##

paella.Plugin (common to all plugins)
----------------------

- getIndex(): Plugin configuration. Override: optional. It returns the plugin index.

- checkEnabled(onSuccess): Life cycle operation. Override: optional. This function tells the plugin handler if this plugin is or is not enabled by calling the `onSuccess(bool) callback. You can perform this operation asynchronously, for example, checking the plugin status with an Ajax request.

- setup(): Life cycle operation. Override: optional. Use this function as a constructor. The setup() method is called inmediately after the checkEnabled() function returns the plugin activation status. This function will not be called if the plugin is not enabled.

- getName(): Plugin configuration. Override: required. It returns the plugin name. The plugin name must to be unique, so it's recommended to use full qualified domain names to generate the plugin names.


paella.ButtonPlugin (extends paella.Plugin)
-------------------

This class is used to add buttons to the playback bar. All the visual aspects, except the alineation in the playback bar (left or right) will be configured in the plugin's style sheet file.

- getAlignment(): Plugin visual configuration. Override: optional. It returns the plugin alignment in the playback bar. The only valid values are `paella.ButtonPlugin.alignment.left` or `paella.ButtonPlugin.alignment.right`. Default value: `paella.ButtonPlugin.alignment.left`

- getSubclass(): Plugin visual configuration. Override: required. It returns the button's CSS subclass. Use this to specify the button style in the plugin's stylesheet file. The button's full class name will be like `buttonPlugin [left|right] [subclass]`

- getButtonType(): Plugin operation/visual configuration. Override: optional. Default value: paella.ButtonPlugin.type.actionButton. It returns the button type: action button, popUp button or time line button. The pop up and time line button types will show a container above the playback bar. The time line container occupy the entire playback bar width, while the popup's width is defined in the plugin's style sheet.

- action(button): Plugin operation. Override: required if the plugin is an actionButton plugin. This method will be called when the user push the plugin's button. the `button` parameter is the button dom element.

- getMinWindowSize(): Plugin visual configuration. Override: required. Default value:0. It returns the minimum window width to show the player's button. If the window with is less than the required window size, the button will be hidden. The plugin handler will call this function every time the window is resized

- buildContent(domElement): Plugin operation/visual configuration. Override: required if the plugin is not an actionButton plugin. If the plugin is an actionButton plugin, this method will never be called. Override this method to fill in the pop up or timeline container. The `domElement` parameter is the container to fill-in. It's a standard html dom node: you can use the innerHTML method to specify it's content, or you can use the appendChild() method to create the internal DOM structure.



utility functions:

- changeSubclass(newSubclass): Use this function to change the button's subclass. This code is extracted from the standard Paella Player play button plugin:
	
	setup:function() {
		var This = this;
		paella.events.bind(paella.events.play,function(event) {
			This.changeSubclass(This.pauseSubclass);
		});
		paella.events.bind(paella.events.pause,function(event) {
			This.changeSubclass(This.playSubclass);
		});
	}

To switch between the play and pause icon, the playButton plugin listen to the play and pause events. If the play event is triggered, the button subclass is changed to pauseSubclass, and if the pause event is triggered the button subclass is changed to playSubclass.


paella.EventDrivenPlugin (extends paella.Plugin)
------------------------

Use this class to implement plugins that responds to events.

- getEvents()

- onEvent(eventType,params)

TODO: paella extended plugins (paella.RightBarPlugin, paella.TabBarPlugin)
--------------------------------------------------------------------------

## Editor plugins
paella.editor.EditorPlugin (common)
-----------------------------------

- onTrackSelected(newTrack)

- onSave(success)

- onDiscard(success)

- contextHelpString()



paella.editor.TrackPlugin
-------------------------

- getTrackName()

- getColor()

- getTextColor()

- getTrackType()

- getTrackItems()

- allowResize()

- allowDrag()

- allowEditContent()

- onTrackChanged(id,start,end)

- onTrackContentChanged(id,content)

- onSelect(trackItemId)

- onUnselect()

- onDblClick(trackData)

- getTools()

- onToolSelected(toolName)

- getSettings()



paella.editor.MainTrackPlugin (extends paella.editor.TrackPlugin)
-----------------------------------------------------------------

- getTrackType()

- getTrackItems()



paella.editor.RightBarPlugin
----------------------------

- getTabName()

- getContent()

- onLoadFinished()



paella.editor.EditorToolbarPlugin
---------------------------------

- getButtonName()

- getIcon()

- getOptions()

- onOptionSelected()




