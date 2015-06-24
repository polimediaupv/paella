# es.upv.paella.viewModePlugin

This plugin controls the visualization mode related to the Master and the Slave video and their position on the screen.

![](images/viewModePlugin.jpg)

## Plugin Type:
- [paella.ButtonPlugin](../developer/plugin_types.md)

## Related Plugins

[**es.upv.paella.blackBoardPlugin**](es.upv.paella.blackBoardPlugin.md)


## Configuration Parameters

* **activeProfiles**

	List of profiles to show
	- default value: null
	- range: [...]
	- available profiles: "s_p_blackboard2", "slide_professor", "professor_slide", "professor", "slide", "slide_over_professor", "slide_over_professor_right", "professor_over_slide", "professor_over_slide_right"




## Config Example:

```json
{
	"es.upv.paella.viewModePlugin": 
	{
		"enabled": true,
		"activeProfiles": ["s_p_blackboard2", "slide_professor", "professor_slide", "professor", "slide", "slide_over_professor", "slide_over_professor_right", "professor_over_slide", "professor_over_slide_right"]
	}
}
```
