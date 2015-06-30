# PLUGIN CREATION

You can create plugin for your purposes at local installation using the **'vendor/'** directory, but if you want to create a new plugin and integrate it with paella make the new plugin under **'plugins/'** directory and send us a pull request when its done for integrate your functionality with our system.

##CREATION

For explain better the plugin creation steps we are going to use the current "helpPlugin" as an example. This plugin shows a popup window with help to the final user.

###Step #1 
- Create a folder under Paella-Project/Plugin.

All files/directories under the new folder will be inserted in Paella for his use.

###Step #2
- Create files and direcories inside our new directory with this structure.

    - /localization

    - /resources

    - myPluginName.js

    - myPluginName.less


Inside <b>LOCALIZATION</b> we going to make a json for translate the text showed in the tooltip of our plugin button. The name of the json must be using the ISO 3166-1. 

example: /localizacion/<b>es</b>.json
```javascript
{
	"Show help": "Mostrar ayuda",
	"Paella version:": "Versión de paella:"
}
```

<b>RESOURCES</b> Use this directory for keep all resources that we are going to use in our plugin.

<b>myPluginName.js</b> This will be our plugin main core file.

<b>myPluginName.less</b>This will be our plugin main style file.

### Step #3
- Select your plugin [TYPE](plugin_types.md)
- Create your plugin class.

example: helpPlugin.js (buttonPlugin)
```javascript
Class ("paella.plugins.HelpPlugin",paella.ButtonPlugin, {...});

```

example: zoomPlugin.js (EventDrivenPlugin)
```javascript
Class ("paella.ZoomPlugin", paella.EventDrivenPlugin,{...});

```

### Step #4
Using the main methods:

example: helpPlugin.js (buttonPlugin)

```javascript
{
	getIndex:function() { return 509; }, // PLUGIN LOAD PRIORITY (LESS BETTER)
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "helpButton"; },
	getName:function() { return "es.upv.paella.helpPlugin"; },
	
	getDefaultToolTip:function() { return base.dictionary.translate("Show help") + ' (' + base.dictionary.translate("Paella version:") + ' ' + paella.version + ')'; },

    setup:function(){
    // THIS FUNCTION IS EXECUTED AFTER A TRUE ON CHECKENABLED METHOD 
    }
    
	checkEnabled:function(onSuccess) { // SHOWS THE PLUGIN IF THIS METHOD RETURNS TRUE
		var availableLangs = (this.config && this.config.langs) || [];
		onSuccess(availableLangs.length>0); 
	},
	
	action:function(button) { // PLUGIN BUTTON PRESSED
		var mylang = base.dictionary.currentLanguage();
		
		var availableLangs = (this.config && this.config.langs) || [];
		var idx = availableLangs.indexOf(mylang);
		if (idx < 0) { idx = 0; }
						
		//paella.messageBox.showFrame("http://paellaplayer.upv.es/?page=usage");
		paella.messageBox.showFrame("resources/style/help/help_" + availableLangs[idx] + ".html");
	}
});  
	paella.plugins.helpPlugin = new paella.plugins.HelpPlugin(); // INSTANTIATE

```

example: zoomPlugin.js (EventDrivenPlugin)

```javascript
...
    getEvents:function() { // LISTEN EVENTS
		return[
			paella.events.timeUpdate,
			paella.events.setComposition,
			paella.events.loadPlugins,
			paella.events.play
		];
    },

    onEvent:function(event, params){ // EVENT TRIGGER
    	var self = this;
    	switch(event){
    		case paella.events.timeUpdate: this.imageUpdate(event,params); break;
    		case paella.events.setComposition: this.compositionChanged(event,params); break;
    		case paella.events.loadPlugins: this.loadPlugin(event,params); break;
			case paella.events.play: this.exitPhotoMode(); break;
    	}
    },
...

```

### Step #5

- Define a style using myPluginName.less

example: zoomPlugin.less

```
.buttonPlugin.helpButton {
	background-position: -520px 0px;
}

```


