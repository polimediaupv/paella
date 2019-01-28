---
---

# es.upv.paella.usertracking.piwikSaverPlugIn

This plugin saves the usertracking events to the [Piwik](https://matomo.org/) service

## Plugin Type:
- [paella.userTracking.SaverPlugIn](../developer/plugin_types.md)

## Configuration Parameters

* **tracker**

	the piwik tracked URL.
	- required

* **siteId**

	the pikiw site ID.
	- required

* **category**

	category to use to save the user events
	- default: "PaellaPlayer"


## Config Example:

```json
{
	"es.upv.paella.usertracking.piwikSaverPlugIn": {
		"enabled": true,
		"tracker": "https//tracker.server.com"
		"siteId": "1"
	}
}
```
