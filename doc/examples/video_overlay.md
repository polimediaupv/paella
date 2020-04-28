---
---


# Video overlay plugin example

## es.upv.paella.liveStreamingIndicatorPlugin

Video overlay plugins are used to add user interface elements to the video contanier. They are similar to the [button plugin](button_plugin.md), but they are placed over the video area, rather than inside the playback bar, and will be hidden at the same time as the playback bar is hidden.

```javascript
paella.addPlugin(function() {
  return class LiveStreamIndicator extends paella.VideoOverlayButtonPlugin {
    ...
```

Regarding the position, these plugins are placed at the top of the video area. The alignment and order is controlled in the same way as with the button type plugins, overriding the `getIndex()` and `getAlignment()` functions.

```javascript
    ...
    getIndex() {return 10;}
    getAlignment() { return 'right'; }
    ...
```

As with [button type plugins](button_plugin.md), by overriding the action function we can program the behavior when the user clicks on it.


```javascript
    ...
    action(button) {
      paella.messageBox.showMessage(paella.utils.dictionary.translate("Live streaming mode: This is a live video, so, some capabilities of the player are disabled"));
   }
  }
});
```

