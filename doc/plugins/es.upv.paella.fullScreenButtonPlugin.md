# es.upv.paella.fullScreenButtonPlugin

This plugin was made for let the user enter/exit in fullscreen mode.

![](images/fullScreenButtonPlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)


## Configuration Parameters

* **reloadOnFullscreen**

	Reload the videos for apply the better resolution.

* **keepUserSelection**

	Keep the user resolution selected.
	- default value: true
	- range: true | false


## Config Example:

Here's are the config lines for this plugin:

```json
{
	"es.upv.paella.fullScreenButtonPlugin": 
	{
		"enabled":true, 
		"reloadOnFullscreen":
		{ 
			"enabled":true, 
			"keepUserSelection":true 
		}
	},
}
```
