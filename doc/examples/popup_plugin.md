---
---

# PopUp button plugin example

## es.upv.paella.themeChooser

Check [button plugin creation](button_plugin.md) document before continue.

### Create the plugin

A button plugin implements three different types of button. By default is a plugin that calls the `action()` function when the user press it, as you can see [here](button_plugin.md). But also you can overwrite the `getButtonType()` function to change this behavior:

```javascript
paella.addPlugin(function() {
  return class ThemeChooserPlugin extends paella.ButtonPlugin {
	
	...

    getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
```

You can also return [paella.ButtonPlugin.type.timeLineButton](timeline_plugin.md) to show a pop up above the playback bar,
that have the same width as the time line.

### Pop up contents

To fill in the pop up contents, overwrite the buildContent() function. This function receive the pop up dom element. You only need to attach to this element whatever you want to show in the pop up. To hide a pop up, you have to call the `paella.player.controls.hidePopUp()` function, with the plugin name as parameter.

```javascript
buildContent(domElement) {
  var This = this;
  paella.player.config.skin.available.forEach((item) => {
    var elem = document.createElement('div');
    elem.className = "themebutton";
    elem.innerText = item.replace('-',' ').replace('_',' ');
    $(elem).click(function(event) {
      paella.utils.skin.set(item);
      paella.player.controls.hidePopUp(This.getName());
    });
  
    domElement.appendChild(elem);			
  });
}
```
