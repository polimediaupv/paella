# es.upv.paella.footprintsPlugin

This plugin shows a statistics bar above the timeline, for give the info about which point of the timeline is the most viewed.

![](images/footprintsPlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)

## Configuration Parameters

* **skin**

	Skin theme to use
	- default value: light.
	- range: "dark" || "light" || custom

* **fillStyle**

	color tu use inthe fill property. Only aplicable when skin is set to custom
	- default value: #d8d8d8
	- range: CSS color

* **strokeStyle**

	color tu use in the stroke  property. Only aplicable when skin is set to custom
	- default value: #ffffff
	- range: CSS color


## Config Example:

Here's are the config lines for this plugin:

```json
{
	"es.upv.paella.footprintsPlugin":
	{
		"enabled":true, 
		"skin": "light"
	}
}
```
