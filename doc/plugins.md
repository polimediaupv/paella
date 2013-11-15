# Paella Plugins #
## Create a new plugin
A plugin is a subclass of any child class of paella.Plugin. To create a plugin, we'll extend any of these classes, depending on the new feature we want to add to Paella Player. The functions that you'll need to implement, will depend on the specific plugin type and configuration, and will be discussed later.

Paella Player assumes that your plugin files are located in the `plugins` directory. If you need to use style sheets, you must to create a file for your javascript code and another one for the CSS code. The javascript file and the stylesheet must have the same name:

	myplugin.js
	myplugin.css

You can use several files to implement your plugin. To do this, you only need to register all the files in the plugin array. To keep the code correctly organized, by convention, the new plugin classes will be placed into the "paella.plugins" namespace.


	paella.plugins.MyNewPlugin = Class.create(paella.[Any paella.Plugin Subclass],{
		// plugin implementation
	});


Inmediately after the plugin implementation, we must to instantiate it. By convention, the plugin instance variable will be placed in the same namespace as its class, and with the same name as the class, starting with a lower case character.


	paella.plugins.myNewPlugin = new paella.plugins.MyNewPlugin()

To test your plugin in development mode, you must to use the file debug.html instead of index.html, and register your plugin in the development plugin array. This array is defined in the file `src/00_base.js`:

	paella.pluginList = [
		'framecontrol.js',
		'playbutton.js',
		'viewmode.js',
		'basic_editor_plugins.js'
	];

In production mode, this array is ignored because the build script compile all paella player files, including the plugins, into one unique file: `paella_player.js`. If you want to exclude some plugin file from the build script, you only must to include it in the file `plugins/ignore.json` as follows:

	[
		"debuglog.js",
		"annotations.js",
		"check_publish.js"
	]

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

- getButtonType(): Plugin operation/visual configuration. Override: optional. Default value: paella.ButtonPlugin.type.actionButton. It returns the button type: action button (paella.ButtonPlugin.type.actionButton), popUp button (paella.ButtonPlugin.type.popUpButton) or time line button (paella.ButtonPlugin.type.timeLineButton). The pop up and time line button types will show a container above the playback bar. The time line container occupy the entire playback bar width, while the popup's width is defined in the plugin's style sheet.

- action(button): Plugin operation. Override: required if the plugin is an actionButton plugin. This method will be called when the user push the plugin's button. the `button` parameter is the button dom element.

- getMinWindowSize(): Plugin visual configuration. Override: required. Default value:0. It returns the minimum window width to show the player's button. If the window with is less than the required window size, the button will be hidden. The plugin handler will call this function every time the window is resized

- buildContent(domElement): Plugin operation/visual configuration. Override: required if the plugin is not an actionButton plugin. If the plugin is an actionButton plugin, this method will never be called. Override this method to fill in the pop up or timeline container. The `domElement` parameter is the container to fill-in. It's a standard html dom node: you can use the innerHTML method to specify it's content, or you can use the appendChild() method to create the internal DOM structure.

- willShowContent(): Plugin life cycle. Override: optional. Paella will call this function before the container of a button is shown. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.

- didShowContent(): Plugin life cycle. Override: optional. Paella will call this function after the container of a button is shown. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.

- willHideContent(): Plugin life cycle. Override: optional. Paella will call this function before the container of a button is hidden. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.

- didHideContent(): Plugin life cycle. Override: optional. Paella will call this function after the container of a button is hidden. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.


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

- hideButton() and showButton(): Hides and shows the button.

paella.VideoOverlayButtonPlugin (extends paella.ButtonPlugin)
----------------------

This class is used to add buttons over the video container, aligned with its the top border. An example of this plugin is the ShowEditorPlugin, used to launch Paella Editor.

This class works exactly in the same way as the paella.ButtonPlugin buttons, but it only can create buttons of type paella.ButtonPlugin.type.actionButton.


paella.EventDrivenPlugin (extends paella.Plugin)
------------------------
Use this class to implement plugins that responds to events.

- getEvents(): Plugin life cycle. Override: required. It returns an array with the events we want to listen. Note that event driven plugin can't listen to paella's early life cycle events, such as paella.events.loadPlugins or paella.events.loadComplete, because the plugins haven't been loaded when these events are triggered.

		getEvents:function() {
			return [paella.events.event1,paella.events.event2, ... ];
		}

- onEvent(eventType,params): Plugin life cycle. Override: required. This function will receive the events we have registered in getEvents() function.


paella.ExtendedPlugin (extends paella.Plugin)
---------------------
This is the base class of a Paella Extended's plugin, and the only thing that do is to modify the default behaviour of the plugin to adjust it to the extended mode. This class can not be used directly to implement plugins.


paella.RightBarPlugin (extens paella.ExtendedPlugin)
---------------------
It allows to create an area at the right side of the screen to display information.

- buildContent(domElement): Plugin life cycle and visual configuration. Override: required. Use this function to fill in the contents of the right screen area, with the data you want to show. It work in the same way as the paella.ButtonPlugin.buildContent() function.


paella.TabBarPlugin (extens paella.ExtendedPlugin)
-------------------
It works in a similar way as a RightBarPlugin, but each plugin adds a tab button below the Paella Player's view.

- buildContent(domElement): Plugin life cycle and visual configuration. Override: required. Use this function to fill in the contents of the tab view.

- getTabName(): Plugin visual configuration. Override: required. It returns the name of the tab button.

- action(tab): Plugin behaviour. Override: optional. This function is invoked each time the user clicks in the corresponding plugin tab button. It works in the same way that the paella.ButtonPlugin.action() method.


## Editor plugins
paella.editor.EditorPlugin (extends paella.Plugin)
-----------------------------------
Base class of all Paella Editor plugins. It provides with the editor's basic interaction functions.

- onTrackSelected(newTrack): Paella Editor calls this function when the user switches the current track. The parameter 'newTrack' contains the new selected track, or null if the user has deselected the track.

- onSave(success): This function is called when the user selects the 'Save and close' or 'Save' option in the editor. This function must to call the 'success' callback parameter when the operation is complete.

- onDiscard(success): This function is called when the user selects the 'Discard and close' option in the editor. This function must to call the 'success' callback parameter when the operation is completed.

- contextHelpString(): It returns the plugin's context help string. The context help string is a brief text that explains the functionality of the plugin. It is shown in the editor right bar.



paella.editor.TrackPlugin
-------------------------

- getTrackName(): Plugin visual configuration. Override: required. It returns the name of the track. It's recommendable to translate this name into the user language, using paella.dictionary.translate().

- getColor(): Plugin visual configuration. Override: optional. It returns the CSS color of the track. although the override of this function is optional, it is highly recommendable to do it and return a different color than the other installed tracks.

- getTextColor(): Plugin visual configuration. Override: optional. It returns the CSS color of the track's name text. Override it only if the color returned by getColor() makes difficult to read the track name.

- getTrackItems(): 

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




