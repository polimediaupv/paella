# edu.harvard.dce.paella.flexSkipPlugin

This plugin rewind or goes forward in the time line with 2 buttons. Its compound with two plugins.
(**paella.plugins.FlexSkipPlugin**) and the (**paella.plugins.FlexSkipPluginForward**)

![](/flexSkipPlugin.jpg)

## Plugin Type:
(**paella.plugins.FlexSkipPlugin**)
- [paella.ButtonPlugin](../plugin_type.md)

(**paella.plugins.FlexSkipPluginForward**)
- [paella.ButtonPlugin](../plugin_type.md)

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

	"edu.harvard.dce.paella.flexSkipPluginForward": 
	{
		"enabled":true, 
		"direction": "Forward",
		"seconds": 30
	},
}
```
