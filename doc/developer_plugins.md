# Paella Plugins

## Create a new plugin

A plugin is a subclass of any child class of paella.Plugin. To create a plugin, we'll extend any of these classes, depending on the new feature we want to add to Paella Player. The functions that you'll need to implement, will depend on the specific plugin type and configuration, and will be discussed later.

Paella Player assumes that your plugin files are located in the `plugins` folder. You must create a folder for your new plugin and put there your jsvascript and CSS files.
You can use several files to implement your plugin. All those files will be concatenated and put together at the build step.
If your plugin needs any resource, then you can create a folder called resorces and put there all your plugin needs.

	plugins
	 \- es.upv.pluginName
	     |- myplugin.js
	     |- myplugin.css
	     \- resources
	        \- ...

To keep the code correctly organized, by convention, the new plugin classes will be placed into the "paella.plugins" namespace.

``` js
paella.plugins.MyNewPlugin = Class.create(paella.[Any paella.Plugin Subclass],{
	// plugin implementation
});
```

Inmediately after the plugin implementation, we must to instantiate it. By convention, the plugin instance variable will be placed in the same namespace as its class, and with the same name as the class, starting with a lower case character.

``` js
	paella.plugins.myNewPlugin = new paella.plugins.MyNewPlugin()
```


## Plugin life cycle

The plugin life cycle starts with it's instantiation. After that, Paella Player loads all its resources and triggers the `paella.events.loadPlugins` event.

The Paella Player's plugin architecture is extensible: you can create new plugin types by registering your plugin handler in the paella.PluginManager object. When Paella Player triggers the `paella.events.loadPlugins` event, all the plugin handlers will load the plugins that they known how to treat. The plugin life cycle is slightly different depending on the plugin's type, but basically can be categorized as follows:

1. instantiate: you create the new instance of your plugin. In this moment, the plugin registers itself in the plugin manager object. It's very important to not override the plugin's constructor, and if you do it, it's essential to call the parent constructor to correctly register the plugin.

2. Paella Player triggers the paella.events.loadPlugins when all resources are loaded (string dictionaries, video streams, access control and video data and other video resources)

3. Plugin order: all plugins are ordered by it's index. The plugin's index is an integer number that specify the order in wich the different plugins will be loaded: the lower is the plugin's index, the sooner will be loaded.

4. Check enable status: the plugin's handler checks if the plugin is or is not enabled. If the plugin is not enabled, it's life cycle ends here: a plugin can not be enabled afther this point.

5. Setup the plugin: the plugin's handler call the plugin's setup method. If you need to perform some initialization in your plugin, this is the prefered place to do it, not the constructor.

6. Specific plugin life cycle: from this point, each plugin will perform its specific life cycle operations.



## Paella plugins types


- [Player plugins types](developer_plugins_player.md)

- [Editor plugins types](developer_plugins_editor.md)



