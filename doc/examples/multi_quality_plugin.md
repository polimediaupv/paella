---
---

# Menu button plugin example

## es.upv.paella.multipleQualitiesPlugin

Check [popup button plugin creation](popup_plugin.md) document before continue.

### Create the plugin

Menu type plugins are a special type of pop-up plugin that automatically generate content via a menu. Therefore, the `buildContent` function is replaced by a series of functions to handle the content of that menu. To implement a menu button plugin, override the `getButtonType()` function to specify 'menuButton` type:

```javascript
paella.addPlugin(function() {
  return class MultipleQualitiesPlugin extends paella.ButtonPlugin {
	
	...

    getButtonType() { return paella.ButtonPlugin.type.menuButton; }
```

### Menu content

The menu content is returned as an array of objects that have the following properties:

- id: the identifier of the menu item
- title: the visible text label.
- value: this is an optional field for specifying a value, if the identifier is not sufficient
- icon: if the menu consists of icons, the icon for this menu option is returned here. If icon is specified, the title will not be displayed.
- className: is the value of the `class` attribute that the corresponding HTML element will have with the menu option.
- default: if 'true' is specified, the name 'selected' will be added to the element's class.

```javascript
    ...

    getMenuContent() {
        let buttonItems = [];

        this._available.forEach((q,index) => {
            let resH = q.res && q.res.h || 0;
            if (resH>=this.config.minVisibleQuality || resH<=0) {
                buttonItems.push({
                    id: q.shortLabel(),
                    title: q.shortLabel(),
                    value: index,
                    icon: "",
                    className: this.getButtonItemClass(q.shortLabel()),
                    default: false
                });
            }
        });
        return buttonItems;
    }

    ...
```


### Menu item selection

When the user selects a menu option, the 'menuSelected(itemData)` function will be called, passing the data of the selected item. Since menu-type plugins are a special kind of pop-up plug-in, the `paella.player.controls.hidePopUp(name)` function can be used to hide the pop-up menu when selecting the menu option.

```javascript
    ...

    menuItemSelected(itemData) {
        paella.player.videoContainer.setQuality(itemData.value)
            .then(() => {
                paella.player.controls.hidePopUp(this.getName());
                this.setQualityLabel();
            });
    }

    ...
```
