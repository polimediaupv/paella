# es.upv.paella.translecture.captionsPlugin

This plugin loads the video captions from the [translectures project](https://www.translectures.eu/)


## Plugin Type:
- [paella.EventDrivenPlugin](../developer/plugin_types.md)

## Configuration Parameters

* **tLServer**

	URL to translectures server.
	- required

* **tLdb**

	translectures DB
	- required

* **tLEdit**

	URL to edit the captions
	- optional. If defined, the player lets you to edit the captions.

	  Some variables can be use in the URL
	  - ${videoId}: the video identifier
	  - ${tl.lang.code}: language to edit


## Config Example:

```json
{
	"es.upv.paella.translecture.CaptionsPlugIn": {
		"enabled": true,
		"tLServer": "https://www.translectures.eu/tl",
		"tLdb": "db",
		"tLEdit": "/rest/plugins/translectures/redirectToEditor/${videoId}?lang=${tl.lang.code}"
	}
}
```
