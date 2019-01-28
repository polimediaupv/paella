---
---

# es.upv.paella.frameControlPlugin

This plugin adds the functionability of jump to any time in the timeline where the slides are changed through a little images preview interface.

![](images/frameControlPlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)

## Configuration Parameters

* **showFullPreview**

	This option let the user to select where the preview image is shown or disable the feature.
	- default value: auto
	- range: auto | master | slave | disabled


## Config Example:

```json
{
	"es.upv.paella.frameControlPlugin": 
	{
		"enabled":true,
		"showFullPreview": "auto"
	},
}
```
