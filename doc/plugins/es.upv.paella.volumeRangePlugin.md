# es.upv.paella.volumeRangePlugin

This plugin is responsible of control the volume pop-up plugin in the paella player. Can be configured for control all sources volume.

![](images/volumeRangePlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)

## Configuration Parameters


* **showMasterVolume**

	Option to control and show Master volume slider volume controller.
	- default value: true
	- range: true | false

* **showSlaveVolume**

	Option to control and show Slave volume slider volume controller.
	- default value: false
	- range: true | false

## Config Example:

Here's are the config lines for this plugin:

```json
"es.upv.paella.volumeRangePlugin":
{
	"enabled":true, 
	"showMasterVolume": true, 
	"showSlaveVolume": false 
},
```
