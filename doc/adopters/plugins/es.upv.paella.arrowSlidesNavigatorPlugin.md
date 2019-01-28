---
---

# es.upv.paella.arrowSlidesNavigatorPlugin

This plugin adds the functionability of jump to the next/privoius slide change.

![](images/arrowSlidesNavigator.png)

## Plugin Type:
- [paella.EventDrivenPlugin](../developer/plugin_types.md)

## Configuration Parameters

* **showArrowsIn**

	This option let the user to select where the arrows will appear.
	- default value: slave
	- range: full | master | slave

## Config Example:

```json
{
	"es.upv.paella.arrowSlidesNavigatorPlugin": 
	{
		"enabled": true,
		"showArrowsIn": "slave"
	},
}
```
