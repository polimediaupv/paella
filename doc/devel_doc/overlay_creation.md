##onScreenDrawing api
Paella 5.0 introduces a new api that is used to generate layers over the drawing 
canvas of the paella player

###Invocation method

```
var layer = paella.player.videoContainer.overlayContainer.getLayer("layername");
```

If the layer "layername" exists this function returns the dom object of the layer
in other case it creates a new layer with id="layername" and returns it aswell.

Afterwards we can work with the dom object adding elements to it that will be 
represented over the player.