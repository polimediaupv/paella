---
---

# Buffered video playback bar canvas plugin


## es.upv.paella.BufferedPlaybackCanvasPlugin

This type of plugin allows you to draw content on the Paella Player playback bar.

The playback bar consists of three layers. The background layer and the front layer are two canvas where we can draw content with plugins. The central layer is the play bar that indicates the current time instant. By drawing in one of these canvas we can control if the content is drawn in front or behind the playbar.

The `drawCanvas(context, width, height, videoData)` function is called every time the playback bar needs to be updated.

* context: array with two elements corresponding to the two layers:
    1. context[0]: bottom layer
    2. context[1]: top layer
* width, height: size of the canvas
* videoData: an object that contains the relevant information of the video:
    1. duration: full duration of the video, ignoring the trimming
    2. trimming
        - enabled: true | false
        - start: trimming start
        - end: trimming end
        - duration: trimmed duration of the video.
 
### Creation: extend paella.PlaybackCanvasPlugin
 
As usual, the first step is to extend the class corresponding to the plugin type and create the unique identifier:

```javascript
paella.addPlugin(() => {

    return class BufferedPlaybackCanvasPlugin extends paella.PlaybackCanvasPlugin {
        getName() {
            return "es.upv.paella.BufferedPlaybackCanvasPlugin";
        }
        
        ...
```

I addition, you can use the `checkEnabled(onSuccess)` and `setup()` functions to decide if the plugin is enabled and to perform some setup.

### Drawing: implement `drawCanvas()` function

This type of plugin only adds the `drawCanvas` function. Generally, the data to be represented will be related to the video timeline, that's why this information is provided in the videoData parameter.

Also included is an array with the canvas corresponding to the background layer and the front layer, and the size of the canvas.

If more data is needed, the `onSuccess` functions can be used, for asynchronous data and  `setup` for synchronous data.


```javascript
        ...
        drawCanvas(context,width,height,videoData) {
            function trimmedInstant(t) {
                t = videoData.trimming.enabled ? t - videoData.trimming.start : t;
                return t * width / videoData.trimming.duration;
            }
            
            let buffered = paella.player.videoContainer.streamProvider.buffered;
            for (let i = 0; i<buffered.length; ++i) {
                let start = trimmedInstand(buffered.start(i));
                let end = trimmedInstant(buffered.end(i));
                this.drawBuffer(context,start,end,height);
            }
        }
        
        drawBuffer(context,start,end,height) {
            context[0].fillStyle = this.config.color;
            context[0].fillRect(start, 0, end, height);
        }
   }
});
```

Note that both canvas are shared by all plugins, so there are operations that should be avoided, such as cleaning the canvas. It is also possible that this will cause some incompatibilities between different plugins, such as the content of one plugin obstructing the content of a previous plugin. To avoid this problem, it is recommended to draw using transparent colors:

**config/config.json:**

```json
    ...
    "es.upv.paella.BufferedPlaybackCanvasPlugin": {
        "enabled": true,
        "color": "rgba(0, 0, 0, 0.4)"
    }
    ...
```
