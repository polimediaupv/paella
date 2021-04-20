---
---

# Integration (Advanced)

## JavaScript APIs to load Paella Player

To integrate Paella Player in your portal, you must to suply a series of data about the video streams and the user account. 
Some of these data are optional, but if aren't supplied is possible that some features are disabled.

## Video data

All the information about a particular video is stored in the video manifest file [video manifest file](../integrate_datajson.md). The video loading APIs are used to get the video manifest.

## Loading API

There are many options for loading Paella Player. Let's see several examples starting from the following code:

``` HTML
<!DOCTYPE html>
<html>
  <head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8;">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Paella Engage Example</title>

  <script type="text/javascript" src="javascript/jquery.min.js"></script>
  <script type="text/javascript" src="javascript/lunr.min.js"></script>
  <script type="text/javascript" src="javascript/paella_player_es2015.js"></script>
  
  <link rel="stylesheet" href="resources/bootstrap/css/bootstrap.min.css" type="text/css" media="screen" charset="utf-8">

  <script>
    function loadMyPlayer(containerId) {
	  // Load paella player here
	}
  </script>
</head>
<body onload="loadMyPlayer('playerContainer)">
  <div id="playerContainer" style="display:block;width:100%"></div>
</body>
</html>
```

## Load Paella Player from a repository

This is the most convenient method to load Paella Player if you can offer a backend where the manifests are accesible:

```javascript
function loadMyPlayer(containerId) {
  paella.load('playerContainer', { });
}
```

The manifest files will be searched in the default path, which is specified in the config.json file.

```javascript
{
  ...
  "standalone" : {
    "repository": "../repository/"
  },
  ...
}
```

But optionally, you can set the Paella Player repository path dinamically using the `url` parameter:

```javascript
function loadMyPlayer(containerId) {
  paella.load('playerContainer', { url:'../repository/' });
}
```

If the `url` is specified in the `paella.load()` parameters, the `repository` attribute in the configuration file will  be ignored. Note that the `url` path has to end with a slash `/`.

The final video manifest path will be generated as follows:

`[repositoryUrl]/[videoId]/data.json`

## The video identifier

By default, Paella Player gets the video identifier from the URL:

`http://yourvideoplayersite.com/index.html?id=yourVideoIdentifier`

But you can use the `getId` parameter to override this behavior:

```javascript
function loadMyPlayer(containerId) {
  paella.load('playerContainer', { getId: () => "my-video-id" });
}
```

## Video manifest path customization

It's possible to customize the way in which the path of the video manifest is generated using the `videoUrl` and `dataUrl` parameters. Both parameters have to be functions that return the video manifest base path and the full path of the video manifest file respectively. By default, the `dataUrl` function calls the `videoUrl` function. Depending on what you want to do, you will have to override one, the other or both.

```javascript
function loadMyPlayer(containerId) {
  paella.load('playerContainer', { dataUrl: function() {
	  return "full/video/manifest/path";
  }});
}
```

To access these functions from your code, Paella Player exposes them through the following APIs:

```javascript
// `url` initialization parameter, or the content of
// standalone.repository in config.json
paella.player.repoUrl

// Result of `getId()` init parameter
paella.player.videoId

// Result of `videoUrl()` init parameter
paella.player.videoUrl

// Result of `dataUrl()` init parameter
paella.player.dataUrl
```

In the following example you can see an implementation that emulates the default behavior of Paella Player, using `getId`, `dataUrl` and `videoUrl``

```javascript
function myLoadPaella(containerId) {
  paella.load(containerId, {
    getId:() => {
     return paella.utils.parameters.get("id");
    },
    videoUrl: () => {
     return `${ paella.player.repoUrl }${ paella.player.videoId }/`;
    },
    dataUrl: () => {
     return `${ paella.player.videoUrl }/data.json`;
    }
  });
}
```

## Specify the configuration options

By default, the Paella Player configuratio is obtained from the configuration file, which can be found in `paellaPlayerPath/config/config.json`. But you have two options change the configuration file origin.

### Option 1: change the configuration file path

Yo can use the `configUrl` parameter in the `paella.load()` function to set the path of the configuration file:

```javascript
function loadMyPlayer(containerId) {
  paella.load(containerId, { configUrl:'otherConfigPath/config.json' });
}
```

### Option 2: set the configuration by yourself

You can get the configuration on your own and pass it to Paella Player with the parameter `config`:

```javascript
function loadMyPlayer(containerId) {
  fetch('my_rest_api/player/config')
	.then((response) => {
	  return response.json();
	})
	.then((config) => {
	  paella.load(containerId, { config:config });
	})
	.catch((err) => {
	  console.error(err.message);
	});
}
```

## Upload and download data from your server

Paella provides a homogeneous mechanism to write and read persistent data. You can see how it works [here](../../developers/paella_data.md)
