#Paella player plugins

## paella.Plugin (common to all plugins)

- getIndex(): Plugin configuration. Override: optional. It returns the plugin index.

- checkEnabled(onSuccess): Life cycle operation. Override: optional. This function tells the plugin handler if this plugin is or is not enabled by calling the `onSuccess(bool) callback. You can perform this operation asynchronously, for example, checking the plugin status with an Ajax request.

- setup(): Life cycle operation. Override: optional. Use this function as a constructor. The setup() method is called inmediately after the checkEnabled() function returns the plugin activation status. This function will not be called if the plugin is not enabled.

- getName(): Plugin configuration. Override: required. It returns the plugin name. The plugin name must to be unique, so it's recommended to use full qualified domain names to generate the plugin names.


## paella.ButtonPlugin (extends paella.Plugin)

This class is used to add buttons to the playback bar. All the visual aspects, except the alineation in the playback bar (left or right) will be configured in the plugin's style sheet file.

- getAlignment(): Plugin visual configuration. Override: optional. It returns the plugin alignment in the playback bar. The only valid values are `paella.ButtonPlugin.alignment.left` or `paella.ButtonPlugin.alignment.right`. Default value: `paella.ButtonPlugin.alignment.left`

- getSubclass(): Plugin visual configuration. Override: required. It returns the button's CSS subclass. Use this to specify the button style in the plugin's stylesheet file. The button's full class name will be like `buttonPlugin [left|right] [subclass]`

- getButtonType(): Plugin operation/visual configuration. Override: optional. Default value: paella.ButtonPlugin.type.actionButton. It returns the button type: action button (paella.ButtonPlugin.type.actionButton), popUp button (paella.ButtonPlugin.type.popUpButton) or time line button (paella.ButtonPlugin.type.timeLineButton). The pop up and time line button types will show a container above the playback bar. The time line container occupy the entire playback bar width, while the popup's width is defined in the plugin's style sheet.

- getDefaultToolTip(): Plugin accesibility configuration. Override: optional. It returns the default tooltip to be shown.

- action(button): Plugin operation. Override: required if the plugin is an actionButton plugin. This method will be called when the user push the plugin's button. the `button` parameter is the button dom element.

- getMinWindowSize(): Plugin visual configuration. Override: required. Default value:0. It returns the minimum window width to show the player's button. If the window with is less than the required window size, the button will be hidden. The plugin handler will call this function every time the window is resized

- buildContent(domElement): Plugin operation/visual configuration. Override: required if the plugin is not an actionButton plugin. If the plugin is an actionButton plugin, this method will never be called. Override this method to fill in the pop up or timeline container. The `domElement` parameter is the container to fill-in. It's a standard html dom node: you can use the innerHTML method to specify it's content, or you can use the appendChild() method to create the internal DOM structure.

- willShowContent(): Plugin life cycle. Override: optional. Paella will call this function before the container of a button is shown. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.

- didShowContent(): Plugin life cycle. Override: optional. Paella will call this function after the container of a button is shown. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.

- willHideContent(): Plugin life cycle. Override: optional. Paella will call this function before the container of a button is hidden. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.

- didHideContent(): Plugin life cycle. Override: optional. Paella will call this function after the container of a button is hidden. This is only applied to paella.ButtonPlugin.type.popUpButton and paella.ButtonPlugin.type.timeLineButton button plugin types.


utility functions:

- changeSubclass(newSubclass): Use this function to change the button's subclass. This code is extracted from the standard Paella Player play button plugin:
	
	``` js
	setup:function() {
		var This = this;
		paella.events.bind(paella.events.play,function(event) {
			This.changeSubclass(This.pauseSubclass);
		});
		paella.events.bind(paella.events.pause,function(event) {
			This.changeSubclass(This.playSubclass);
		});
	}
	```

To switch between the play and pause icon, the playButton plugin listen to the play and pause events. If the play event is triggered, the button subclass is changed to pauseSubclass, and if the pause event is triggered the button subclass is changed to playSubclass.

- hideButton() and showButton(): Hides and shows the button.

- setToolTip(message): Plugin accesibility function. This function sets the booton tooltip.

- isPopUpOpen(): Returns if the Popup content is open. Returns true if open, false if close.



## paella.VideoOverlayButtonPlugin (extends paella.ButtonPlugin)

This class is used to add buttons over the video container, aligned with its the top border. An example of this plugin is the ShowEditorPlugin, used to launch Paella Editor.

This class works exactly in the same way as the paella.ButtonPlugin buttons, but it only can create buttons of type paella.ButtonPlugin.type.actionButton.


## paella.EventDrivenPlugin (extends paella.Plugin)

Use this class to implement plugins that responds to events.

- getEvents(): Plugin life cycle. Override: required. It returns an array with the events we want to listen. Note that event driven plugin can't listen to paella's early life cycle events, such as paella.events.loadPlugins or paella.events.loadComplete, because the plugins haven't been loaded when these events are triggered.

	``` js
	getEvents:function() {
		return [paella.events.event1,paella.events.event2, ... ];
	}
	```

- onEvent(eventType,params): Plugin life cycle. Override: required. This function will receive the events we have registered in getEvents() function.




## paella.ExtendedPlugin (extends paella.Plugin)

This is the base class of a Paella Extended's plugin, and the only thing that do is to modify the default behaviour of the plugin to adjust it to the extended mode. This class can not be used directly to implement plugins.


## paella.RightBarPlugin (extens paella.ExtendedPlugin)

It allows to create an area at the right side of the screen to display information.

- buildContent(domElement): Plugin life cycle and visual configuration. Override: required. Use this function to fill in the contents of the right screen area, with the data you want to show. It work in the same way as the paella.ButtonPlugin.buildContent() function.


## paella.TabBarPlugin (extens paella.ExtendedPlugin)

It works in a similar way as a RightBarPlugin, but each plugin adds a tab button below the Paella Player's view.

- buildContent(domElement): Plugin life cycle and visual configuration. Override: required. Use this function to fill in the contents of the tab view.

- getTabName(): Plugin visual configuration. Override: required. It returns the name of the tab button.

- action(tab): Plugin behaviour. Override: optional. This function is invoked each time the user clicks in the corresponding plugin tab button. It works in the same way that the paella.ButtonPlugin.action() method.

- getDefaultToolTip(): Plugin accesibility configuration. Override: optional. It returns the default tooltip to be shown.

- setToolTip(message): Plugin accesibility function. Override: None. This function sets the tabbar tooltip.


