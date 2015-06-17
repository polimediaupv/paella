# edu.harvard.dce.paella.flexSkipForwardPlugin

This plugin goes forward in the time line.

![](images/flexSkipPlugin.jpg)

## Plugin Type:

- [paella.ButtonPlugin](../developer/plugin_types.md)

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
	"edu.harvard.dce.paella.flexSkipForwardPlugin": 
	{
		"enabled":true, 
		"direction": "Forward",
		"seconds": 30
	},
}
```
