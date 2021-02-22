# Plugins

## Introduction

Paella Player uses plugins to extend its functionality. Each Paella Player module that can be extended by plugins defines a new plugin type and a specific API, extending the `core/Plugin` base class.

It is also possible to create extensible plugins via plugins in the same way: by creating a new class that extends `core/Plugin` or one of its subclasses.

## Crear un plugin

To create a new plugin of a certain type, create a file in one of the directories specified in the file `plugin_directories.js`:

```json
export default [
    require.context("./src/js/plugins", true, /\.js/),
    require.context("./src/js/layouts", true, /\.js/),
    require.context("./src/js/videoFormats", true, /\.js/),
]
```

The filename must match the plugin name. See section `Plugin name`.

Inside this file, we will extend the class of the plugin we want to implement:

```javascript
import VideoLayout from 'paella/js/core/VideoLayout';

export default class MyVideoLayout extends VideoLayout {
    async isEnabled() {
        return true;    // You can decide here if the plugin may or may not be loaded
    }

    async load() {
        console.log("My video layout plugin is loaded!");
    }

    // Other plugin type specific functions and attributes
}
```

## The Plugin base clase

The base Plugin class provides the following API:

```javascript
const myPluginInstance = getMyPluginInstance(); // dummy function to get the instance of my plugin

myPluginInstance.player;    // The instance of the player that created the plugin
myPluginInstance.name;      // The plugin name, used as unique identifier. See "Plugin name" section
myPluginInstance.config;    // The configuration object. See "Plugin configuration" section
myPluginInstance.order;     // Loading order. See "loading order" section
```

## Plugin name

The plugin name is the unique identifier of a plugin, and is created from the plugin file name. These names must be globally unique, regardless of the type of plugin. That is, two plugins cannot have the same name even if they are of different types.

To avoid name collisions, you can use fully qualified names. The plugin will be named the same as the file, with the extension removed, and case sensitive:

| file name                   | plugin name (identifier)     |
|-----------------------------|------------------------------|
| es.upv.paella.dualVideo.js  | "es.upv.paella.dualVideo"    |


## Plugin configuration

The configuration of the plugin is defined in the `config.json` file, undet the `plugins` configuration object. The key of the object must match the plugin name, and the value is an object with the plugin configuration attributes. The only mandatory attribute of the confiugration object is `enabled`:

```json
{
    ...
    "plugins": {
        "es.upv.paella.mp4VideoFormat": {
            "enabled": true
        },
        "es.upv.paella.hlsVideoFormat": {
            "enabled": true
        },
    }
}
```


## Loading order 

The order in which plugins are loaded depends on the type: when loading a plugin, all plugins of the first type will be loaded first, then all plugins of the second type, and so on.

Within each plugin type, the loading order is defined by the `order` attribute in the plugin configuration:

```json
{
    ...
    "plugins": {
        "es.upv.paella.mp4VideoFormat": {
            "enabled": true,
            "order": 1,
        },
        "es.upv.paella.hlsVideoFormat": {
            "enabled": true,
            "order": 0,
        },
    }
}
```

As for the loading order of plugin types, it depends on the implementation. For example, plugins of type `button`, which add buttons to the interface, will be loaded when Paella Player loads the playbar, plugins of type `video` will be loaded when Paella Player has to determine the type of video stream it has to process, and so on.

## Create a plugin type

To create a new plugin type, we first define a class that returns a new type identifier

```javascript
import Plugin from 'paella/js/core/Plugin';

export default class MyPluginType extends Plugin {

    get type() { return "plugin-type-id"; }

    // TODO: Add the plugin type specific API functions
}
```


## Predefinied plugin types

### Playback bar plugins

These are plugins that allow you to add functionality to the playback bar.

**[ButtonPlugin](button_plugin.md):** They implement a simple button that performs an action when the user presses it.

**[PopUpButtonPlugin](popup_button_plugin.md):** They implement a button that displays a pop up with a content specified by the plugin itself.

**[MenuButtonPlugin](menu_button_plugin.md):** Implements a button that displays a menu with options.

### Video format plugins

These are plugins that allow you to extend the video formats supported by Paella Player. [VideoPlugin](video_plugin.md)

### Video layout plugins

These are plugins that specify the arrangement of videos in the display area. By means of video layouts we enable the playback of one or several streams simultaneously. [VideoLayout](video_layout.md)
