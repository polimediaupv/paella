# Setup a local elasticsearch

## Setting up

To set up the local elasticsearch you need to enable the
[elasticsearch plugin](plugins/es.upv.paella.usertracking.elasticsearchSaverPlugin.md)
in the main [config file](configure.md) (`config/config.json`) and configure the `url` to your elasticsearch server .

## Configuration example:

```json
{
	"es.upv.paella.usertracking.elasticsearchSaverPlugin": {
		"enabled": true,
		"url": "http://my.elastic.server"
	}
}
```
