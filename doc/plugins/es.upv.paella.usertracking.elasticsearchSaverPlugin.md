# es.upv.paella.usertracking.elasticsearchSaverPlugin

This plugin saves the usertracking events to a [elasticsearch](https://www.elastic.co/) server

## Plugin Type:
- [paella.userTracking.SaverPlugIn](../developer/plugin_types.md)

## Configuration Parameters

* **url**

	URL to the elasticsearch server.
	- required

* **index**

	index to use to log the event.
	- default: "paellaplayer"

* **type**

	type to use to log the event.
	- default: "usertracking"


## Config Example:

```json
{
	"es.upv.paella.usertracking.elasticsearchSaverPlugin": {
		"enabled": true,
		"url": "http://my.elastic.server"
	}
}
```
