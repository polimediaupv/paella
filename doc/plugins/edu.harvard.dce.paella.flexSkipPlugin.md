# edu.harvard.dce.paella.flexSkipPlugin

This plugin rewind or goes forward in the time line with 2 buttons. Its compound with two plugins.
(**paella.plugins.FlexSkipPlugin**) and the (**paella.plugins.FlexSkipPluginForward**)

![](images/flexSkipPlugin.jpg)

## Plugin Type:
(**edu.harvard.dce.paella.flexSkipPlugin**)
- [paella.ButtonPlugin](../plugin_type.md)

## Related Plugins 

[**edu.harvard.dce.paella.flexSkipPluginForward**](edu.harvard.dce.paella.flexSkipPluginForward.md)

## Configuration Parameters

* ###direction
	Direction of timeline jump.
	- default value: depends on plugin.
	- range: "Rewind" || "Forward"

* ###seconds
	Seconds to jump.
	- default value: depends on plugin
	- range: Integer


## Config Example:

Here's are the config  lines for this plugin:

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
