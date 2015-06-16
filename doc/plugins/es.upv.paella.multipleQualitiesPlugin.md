# es.upv.paella.multipleQualitiesPlugin

This plugin add the functionality to swap between video resolutions.

![](images/multipleQualitiesPlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)

## Configuration Parameters

* **showWidthRes**

	Shows the full resolution (*width*x*height*) or only the height value.
	- default value: true
	- range: true || false

* **minVerticalRes**
	
	Minimum vertical resolution to show in the UI.
	- optional
	- range: Integer

* **maxVerticalRes**

	Maximum vertical resolution to show in the UI.
	- optional
	- range: Integer

## Config Example:

Here's are the config lines for this plugin:

```json
{
	"es.upv.paella.multipleQualitiesPlugin": 
	{
		"enabled": false,
		"showWidthRes":true
	},
}
```
