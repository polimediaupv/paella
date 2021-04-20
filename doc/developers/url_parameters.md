---
---

# URL Parameters

## Default parameters

By default, Paella Player accepts the following parameters in the URL:

- `id` (required): is the identifier that will be used to load the video manifest
- `time`: instant of time in which the reproduction will start, with the format `XhXXmXXs`, for example: `1h23m15s`.
- `autoplay` (only in browsers that support autoplay): If `autoplay=true` is specified, playback of the video will begin as soon as the page loads.
- `log`: Log level by the console (`error`, `warn`, `debug`, `log`)
- `disable-ui`: It prevents the user interface from loading, as well as plugins that depend on the user interface.
- `muted`: It starts playback without volume, which allows the `autoplay` parameter to work in browsers where it would otherwise not work.

There is a way to generate a video manifest from the URL parameters, with up to two streams, using the following parameters:

- `video`: main video URL.
- `videoSlave`: secondary video URL.
- `preview`: main video preview image.
- `previewSlave`: secondary video preview image.
- `title`: the title of the video.

## Read URL parameters

Plugins can access the default parameters, and new ones, using the following function:

```javascript
paella.utils.parameters.get(paramName)
```

