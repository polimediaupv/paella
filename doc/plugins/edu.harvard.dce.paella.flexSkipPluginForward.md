# edu.harvard.dce.paella.flexSkipPluginForward

This plugin goes forward in the time line.

![](images/flexSkipPlugin.jpg)

## Plugin Type:
(**edu.harvard.dce.paella.flexSkipPluginForward**)

- [paella.ButtonPlugin](../plugin_type.md)

## Related Plugins 

[**edu.harvard.dce.paella.flexSkipPlugin**](edu.harvard.dce.paella.flexSkipPlugin.md)

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
	"edu.harvard.dce.paella.flexSkipPluginForward": 
	{
		"enabled":true, 
		"direction": "Forward",
		"seconds": 30
	},
}
```
