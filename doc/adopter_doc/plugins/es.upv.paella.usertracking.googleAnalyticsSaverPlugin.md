# es.upv.paella.usertracking.googleAnalyticsSaverPlugin

This plugin saves the usertracking events to the [Google Analitycs](https://www.google.es/intl/es/analytics/) service

## Plugin Type:
- [paella.userTracking.SaverPlugIn](../developer/plugin_types.md)

## Configuration Parameters

* **trackingID**

	the google tracking ID.
	- required

* **domain**

	domain to use the google analytics
	- default: "auto"

* **category**

	category to use to save the user events
	- default: "PaellaPlayer"


## Config Example:

```json
{
	"es.upv.paella.usertracking.GoogleAnalyticsSaverPlugIn": {
		"enabled": true,
		"trackingID": "UA-XXXXXXXX-Y"
	}
}
```
