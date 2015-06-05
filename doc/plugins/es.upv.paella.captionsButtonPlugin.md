# es.upv.paella.captionsButtonPlugin

This plugin is divided in two plugins, one is which controls the button and the user interface (**es.upv.paella.captionsButtonPlugin**) and the other is in charge of show the captions below the video (**es.upv.paella.captionsPlugin**).


## Plugin Type:
(**es.upv.paella.captionsButtonPlugin**)
- [paella.ButtonPlugin](../plugin_type.md)

## Related Plugins

[**es.upv.paella.captionsPlugin**](es.upv.paella.captionsPlugin.md)

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
