---
---

# Plugin creation

You can create plugin for your purposes under **'plugins/'** directory and send us a pull request when its done for integrate your functionality with our system.

## Creation

For explain better the plugin creation steps we are going to use the current "helpPlugin" as an example. This plugin shows a popup window with help to the final user.

### Step #1 

- Create a folder under Paella-Project/Plugin.

All files/directories under the new folder will be inserted in Paella for his use.

### Step #2

- Create files and direcories inside our new directory with this structure.

    * /localization
    * /resources
    * myPluginName.js
    * myPluginName.less


Inside **LOCALIZATION** we going to make a json for translate the text showed in the tooltip of our plugin button. The name of the json must be using the ISO 3166-1. 

example: /localizacion/**es**.json

```javascript
{
	"Show help": "Mostrar ayuda",
	"Paella version:": "Versión de paella:"
}
```

**RESOURCES** Use this directory for keep all resources that we are going to use in our plugin.

**myPluginName.js** This will be our plugin main core file.

**myPluginName.less** This will be our plugin main style file.

### Step #3

- Select your plugin [TYPE](plugin_types.md)
- Register your plugin: function. To register the plugin, you have to call `paella.addPlugin()` function passing as parameter a closure that has to return the class that implements your plugin.

example: helpPlugin.js (buttonPlugin)

```javascript
paella.addPlugin(() => {
  return class HelpPlugin extends paella.ButtonPlugin {
    // plugin implementation
```

### Step #4

- Implement your plugin

example: helpPlugin.js (buttonPlugin)

```javascript
  // plugin implementation
  getIndex() { return 509; }
  getAlignment() { return 'right'; }
  getSubclass() { return "helpButton"; }
  getIconClass() { return 'icon-help'; }
  getName() { return "es.upv.paella.helpPlugin"; }
  
  getDefaultToolTip() {
	return paella.utils.dictionary.translate("Show help") + ' (' +
		   paella.utils.dictionary.translate("Paella version:") +
		   ' ' + paella.version + ')';
  }
  
  
  checkEnabled(onSuccess) { 
  	var availableLangs = (this.config && this.config.langs) || [];
  	onSuccess(availableLangs.length>0); 
  }
  
  action(button) {
  	var mylang = paella.utils.dictionary.currentLanguage();
  	var availableLangs = (this.config && this.config.langs) || [];
  	var idx = availableLangs.indexOf(mylang);
	if (idx < 0) { idx = 0; }
	myLang = availableLangs[idx];
	  
  	let url = `resources/style/help/help_${ availableLangs[idx] }.html`;
  	if (paella.utils.userAgent.browser.IsMobileVersion) {
  	  window.open(url);
  	}
  	else {
  	  paella.messageBox.showFrame(url);
  	}
  }
}); 
```

### Step #5

- Define a style using myPluginName.less, if required. It's important that you use the predefined `less` attributes for the colors and styles of Paella Player, so that your plugin is integrated into the skins definition system. You can use the following `less` attributes:

```less
@fontFamily
@linkColor
@linkHoverColor
@linkActiveColor
@mainColor
@hoverBackgroundColor
@backgroundColor
@shadowColor
@icon_text_color
@popup_text_color
@playbackBarButtonHeightPx
@playbackBarButtonWidthPx
@paellaIconsFontSizePx
@paellaIconsPaddingLeftPx
@paellaIconsLineHeightPx
@playbackBarButtonPadding
@playbackControlHeightPx
@playbackBarFontSize: 12px;
```

For more information, the documentation about the [skining system](../adopters/skining.md)
