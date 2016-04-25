# Setup Google Analytics

## Setting up

To set up the google analytics you need to enable the
[google analytics plugin](plugins/es.upv.paella.usertracking.googleAnalyticsSaverPlugin.md)
in the main [config file](configure.md) (`config/config.json`) and configure your Google Analytics ID.

## Configuration example:

```json
{
	"es.upv.paella.usertracking.GoogleAnalyticsSaverPlugIn": {
		"enabled": true,
		"trackingID": "UA-XXXXXXXX-Y"
	}
}
```
