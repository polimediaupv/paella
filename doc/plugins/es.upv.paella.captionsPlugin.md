# es.upv.paella.captionsPlugin

This plugin is divided in two plugins, one is which controls the button and the user interface (**paella.plugins.CaptionsPlugin**) and the other is in charge of show the captions below the video (**paella.plugins.CaptionsOnScreen**).


## Plugin Type:
(**paella.plugins.CaptionsPlugin**)
- [paella.ButtonPlugin](../plugin_type.md)

(**paella.plugins.CaptionsOnScreen**)
- [paella.EventDrivenPlugin](../plugin_type.md)
## Configuration Parameters

* ###searchOnCaptions
	This option let the user search for captions on a pop-up interface above the plugin button.
	- default value: false
	- range: true | false


## Config Example:

Here's are the config  lines for this plugin:

```json
{
	"es.upv.paella.captionsPlugin":
	{
		"enabled":true,
		"searchOnCaptions":false
	},
}
```
