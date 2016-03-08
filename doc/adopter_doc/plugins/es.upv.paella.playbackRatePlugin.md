# es.upv.paella.playbackRate

Button Plugin in charge set the speed of the source.

![](images/playbackRate.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)

## Configuration Parameters

* **availableRates**

	Array with available playback rates
	- default value: [0.75, 1, 1.25, 1.5]
	- range: Array of floats

## Config Example:

Here's are the config lines for this plugin:

```json
{
	"es.upv.paella.playPauseButtonPlugin":
	{
		"enabled":true
	},
}
```
