# es.upv.paella.zoomPlugin

This plugin was made for add the zoom functionality to paella player for be able to zoom blackboard photos. It creates new icons hover the MasterVideo to enter in the photo display mode.

## Configuration Parameters



* ###maxZoom
	```
	default value: 500
	```

	Value for the maximum zoom the plugin can reach.

* ###minZoom
	```
	default value: 100
	```
	
	Value for the minimium zoom the plugin can reach.

* ###zoomIncr: 
 	```
	default value: 10
	```
 
	Value for the update on every zoom change.


## Config Example:

Here's are the config  lines for this plugin:

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