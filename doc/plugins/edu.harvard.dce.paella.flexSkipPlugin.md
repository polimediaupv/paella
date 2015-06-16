# edu.harvard.dce.paella.flexSkipPlugin

This plugin is used to rewind the timeline back in time 10 seconds by default.

![](images/flexSkipPlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../plugin_type.md)

## Related Plugins 

[**edu.harvard.dce.paella.flexSkipPluginForward**](edu.harvard.dce.paella.flexSkipPluginForward.md)

## Configuration Parameters

* **direction**

	Direction of timeline jump.
	- default value: depends on plugin.
	- range: "Rewind" || "Forward"

* **seconds**

	Seconds to jump.
	- default value: depends on plugin
	- range: Integer


## Config Example:

Here's are the config lines for this plugin:

```json
{
	"edu.harvard.dce.paella.flexSkipPlugin": 
	{
		"enabled":true, 
		"direction": "Rewind", 
		"seconds": 10
	},
}
```
