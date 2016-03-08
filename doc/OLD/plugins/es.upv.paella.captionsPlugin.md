# es.upv.paella.captionsPlugin

This plugins activates the subtitles bar below the video with the default browser language, and displays a popup for if you want to change the language instead of using the browser default.

![](images/captionsButtonPlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)

## Related Plugins

- [**es.upv.paella.overlayCaptionsPlugin**](es.upv.paella.overlayCaptionsPlugin.md)
- [**es.upv.paella.captions.DFXPParserPlugin**](es.upv.paella.captions.DFXPParserPlugin.md)

## Configuration Parameters

* **searchOnCaptions**

	This option let the user search for captions on a pop-up interface above the plugin button.
	- default value: false
	- range: true | false


## Config Example:

Here's are the config lines for this plugin:

```json
{
	"es.upv.paella.captionsPlugin":
	{
		"enabled":true,
		"searchOnCaptions":false
	},
}
```
