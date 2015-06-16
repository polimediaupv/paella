# es.upv.paella.zoomPlugin

This plugin was made for add the zoom functionality to paella player for be able to zoom blackboard photos. It creates new icons hover the MasterVideo to enter in the photo display mode.


## Plugin Type:
- [paella.EventDrivenPlugin](../developer/plugin_types.md)

## Configuration Parameters

* **maxZoom**
	
	Value for the maximum zoom the plugin can reach.
	- default value: 500

* **minZoom**

	Value for the minimium zoom the plugin can reach.
	- default value: 100

* **zoomIncr**

	Value for the update on every zoom change.
	- default value: 10

## Config Example:

Here's are the config lines for this plugin:

```json
{
	"es.upv.paella.ZoomPlugin": {
		"enabled": false, 
		"maxZoom":500, 
		"minZoom":100, 
		"zoomIncr":10},
	}
}
```
