---
---

# Paella 5.3 API changes

In Paella 5.2.x, the plugins were registered by instantiating their class:

```
Class ("paella.plugins.PlayPauseButtonPlugin",paella.ButtonPlugin, {
    ....
});

paella.plugins.playPauseButtonPlugin = new paella.plugins.PlayPauseButtonPlugin();
```

Using this method, it was very difficult to control the plugins life cycle, because Paella Player has no control
ofthe instant that the plugin is instantiated.

To improve the life cycle control, from Paella Player 5.3, the plugins are instantiated using a function that receive
a closure as parameter. This closure returns the class that implements the plugin. Paella Player will call the closure
when the plugin must be instantiated.

Also, the plugins code must be defined using the new ECMAScript 2015 standard.

```
paella.addPlugin(function() {
	return class PlayPauseButtonPlugin extends paella.ButtonPlugin {
		constructor() {
			super();
			this.playIconClass = 'icon-play';
			this.pauseIconClass = 'icon-pause';
			this.playSubclass = 'playButton';
			this.pauseSubclass = 'pauseButton';
		}
	
		...
	}	
});
```

# Data delegates

The data delegate definition has been modified using an identical approach as the new plugin definition system, but
in this case, the new system is backward compatible. Anyway, the old data delegate definition system has been deprecated,
and is recommendable to update the old code.

To define a data delegate, you only need to define the data delegate class in the same way as it is done with the plugins,
but in this case, the function also receives a parameter that specify the context. With this parameter, you can define
the context that will use the data delegate by default, without having to do it in the configuration file.

You still can use the configuration file to define the data delegate context, and the parameters defined in the configuration
files are more priority than those defined in the code.

```
paella.addDataDelegate("context",() => {
    return class MyDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) { ... }
    
        write(context,params,value,onSuccess) { ... }
    
        remove(context,params,onSuccess) { ... }
    };
});
```

You can also define more than one context in the code using an array instead of a string.

```
paella.addDataDelegate(["context1","context2"],() => {
    return class MyDataDelegate extends paella.DataDelegate {
        read(context,params,onSuccess) { ... }
    
        write(context,params,value,onSuccess) { ... }
    
        remove(context,params,onSuccess) { ... }
    };
});
```
