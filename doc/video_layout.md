# Video layout plugins

## Define a VideoLayout plugin

```javascript
import VideoLayout from 'paella/js/core/VideoLayout';

export default class MyVideoLayout extends VideoLayout {
    // properties and functions
}
```

## Configuration

*config.json*
```json
{
    "plugins": {
        "es.upv.paella.myVideoLayout": {
            "enabled": true,
            "validContent": [
                { "id": "presenter", "content": ["presenter"] },
                { "id": "presentation", "content": ["presentation"] }
            ]
        }
    }
}
```

## Layout properties and functions

### Identifier

```javascript
get identifier() { return "my-video-layout"; }
```

### Icon

```javascript
get icon() { return "icon.jpg"; }
```

### Valid content

This property returns the `content` array in the plugin configuration:

```javascript
get validContent() {
    return this.config?validContent;
}
```

### Checking if the layout is compatible with the video

Get the valid stream data combination, according to the plugin configuration.
The result of this function must be an array of arrays with all the possible
combinations. For example:

**video manifest (data.json)**
```json
{
    "streams": [
        {
            "sources": {
                ...
            },
            "content": "presenter"
        },
        {
            "sources": {
                ...
            },
            "content": "presentation"
        }
    ]
}
```

**plugin configuration**

```json
"es.upv.paella.dualVideo": {
    "enabled": true,
    "validContent": [
        { "id": "presenter-presentation", "content": ["presenter","presentation"] },
        { "id": "presenter-2-presentation", "content": ["presenter-2","presentation"] },
        { "id": "presenter-presenter-2", "content": ["presenter","presenter-2"] }
    ]
}
```

The result of `getValidStreams` can be:

```javascript
[
    ["presenter","presentation"]
]
```

With the same video manifest, and a plugin with the following configuration:

```json
"es.upv.paella.singleVideo": {
    "enabled": true,
    "validContent": [
        { "id": "presenter", "content": ["presenter"] },
        { "id": "presentation", "content": ["presentation"] },
        { "id": "presenter-2", "content": ["presenter-2"] }
    ]
},
```

The result of `getValidStreams` can be:

```javascript
[
    ["presenter"],
    ["presentation"]
]
```

```javascript
getValidStreams(streamData) {
    // The default implementation checks if the streamData content matches 
    // the videoContent.content array in the plugin configuration, but
    // here you can add more conditions
    // For example: allow only configurations with one stream.
    return super.getValidStreams(streamData)
        .filter(stream => stream.length === 1);
}
```

The exact content of the `getValidStreams` function result depends on the layout plugin implementation. For example, you can implement a layout commpatible with a variable number of streams

### Layout structure

```javascript
getLayoutStructure(streamData) {
    const structure = {
        name:{es:"One stream"},
        hidden:false,
        videos: [
            {
                content:validContent[0],
                rect:[
                    { aspectRatio:"1/1",left:280,top:0,width:720,height:720 },
                    { aspectRatio:"6/5",left:208,top:0,width:864,height:720 },
                    { aspectRatio:"5/4",left:190,top:0,width:900,height:720 },
                    { aspectRatio:"4/3",left:160,top:0,width:960,height:720 },
                    { aspectRatio:"11/8",left:145,top:0,width:990,height:720 },
                    { aspectRatio:"1.41/1",left:132,top:0,width:1015,height:720 },
                    { aspectRatio:"1.43/1",left:125,top:0,width:1029,height:720 },
                    { aspectRatio:"3/2",left:100,top:0,width:1080,height:720 },
                    { aspectRatio:"16/10",left:64,top:0,width:1152,height:720 },
                    { aspectRatio:"5/3",left:40,top:0,width:1200,height:720 },
                    { aspectRatio:"16/9",left:0,top:0,width:1280,height:720 },
                    { aspectRatio:"1.85/1",left:0,top:14,width:1280,height:692 },
                    { aspectRatio:"2.35/1",left:0,top:87,width:1280,height:544 },
                    { aspectRatio:"2.41/1",left:0,top:94,width:1280,height:531 },
                    { aspectRatio:"2.76/1",left:0,top:128,width:1280,height:463 }
                ],
                visible:true,
                layer:1
            }
        ],
        background:{content:"slide_professor_paella.jpg",zIndex:5,rect:{left:0,top:0,width:1280,height:720},visible:true,layer:0},
        logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}],
        buttons: [],
        onApply: function() { }
    }
    return structure;
}
```