---
---

# Using the data JSON format

To make easier the use of paella from third parties we have created a [JSON schema](https://github.com/polimediaupv/paella/blob/develop/tools/mediapackagecreator/paella.schema.json) this way we have a standar data format to load streams into paella with the load function. 

```javascript
 paella.load('playerContainer',{ data:dataJSON })
```

We made a [tool](https://raw.githack.com/polimediaupv/paella/develop/tools/mediapackagecreator/index.html) as a playground to define our own JSONs. While some newbies find it useful, usually it is better to have a look to the examples in the /repository/repository_test folder, as they have all the available features and updates.    
 
## JSON Structure

We will detail the JSON structure from the root

```json
{
  "metadata": {},
  "streams": [],
  "frameList": []
}
```


### metadata

This section holds the basic video information: the video title, the duration and the preview image.

The preview image is an url containing the image that will be used as preview for all the video streams. This image must have an aspect ratio of 16:9, that is the default aspect ratio of the Paella Player video container.

If a preview image is defined, and the browser also supports autoplay, it is possible to configure Paella Player to perform a deferred load when the user clicks on the preview.


```json
{
  "metadata": {
    "title": "this is the title",
    "duration": 60,
    "preview": "preview.jpg"
  }
}
```

* title: title of the video
* duration: duration of the video (in seconds)
* preview: preview image is an url containing the image that will be used as preview for all the video streams

### streams

This will hold an array with the diferent video streams that the player will play, the max length of this array should be 2, since paella by default can only play 2 video streams.

```json
{
  "streams": [
    {
      "sources": {},
      "content": "stream content"
    },
    .
    .
    .
  ]
}
```

#### stream

Each stream in the stream array will have:

* sources: source or sources of the data stream 
* content: a tag that describes the content of the video.

##### About the stream content

The `content` attribute is a tag used to determine where the video will be displayed in a multi-stream video. To determine the position of each video in multi-stream videos, Paella Player uses layout plugins. The valid tag values for the `content` property are determined in the plugin configuration, in `config.json`:

Paella Player will use all the configurations that can be linked with the layout plugin settings, matching the `content` property of the stream with the `content` property of the plugin settings. For example, if you have a video with three streams:

```javascript
"streams": [
  {
    "sources": { ... }
    "content": "presenter"
  },
  {
    "sources": { ... }
    "content": "presentation"
  },
  {
    "sources": { ... }
    "content": "presenter-2"
  }
]
```

And using the following configuration:

```javascript
"//**** Video profile plugins": "",
"es.upv.paella.singleStreamProfilePlugin": {
  "enabled": true,
  "videoSets": [
    { "icon":"professor_icon.svg", "id":"presenter", "content":["presenter"]},
    { "icon":"slide_icon.svg", "id":"presentation", "content":["presentation"]}
  ]
},
"es.upv.paella.dualStreamProfilePlugin": { "enabled":true,
  "videoSets": [
    { "icon":"slide_professor_icon.svg", "id":"presenter_presentation", "content":["presenter","presentation"] },
    { "icon":"slide_professor_icon.svg", "id":"presenter2_presentation", "content":["presenter-2","presentation"] },
    { "icon":"slide_professor_icon.svg", "id":"presenter3_presentation", "content":["presenter-3","presentation"] }
  ]
},
"es.upv.paella.tripleStreamProfilePlugin": {
  "enabled": true,
  "videoSets": [
    { "icon":"three_streams_icon.svg", "id":"presenter_presentation_presenter2", "content":["presenter","presentation","presenter-2"] },
    { "icon":"three_streams_icon.svg", "id":"presenter_presentation_presenter3", "content":["presenter","presentation","presenter-3"] }
  ]
},
```

Paella Player will allow to set the following layouts:

* Single stream layout, stream "presenter"
* Single stream layout, stream "presentation"
* Dual stream layout, streams "presenter" and "presentation"
* Dual stream layout, streams "presenter-2" and "presentation"
* Triple stream layout, streams "presenter", "presentation" and "presentation-2"

If you want to add a setting to show the "presenter" and "presenter-2" videos, you can add a `videoSet` to the dualStreamProfilePlugin with the following settings:

```javascript
  "es.upv.paella.singleStreamProfilePlugin": {
    "enabled": true,
    "videoSets": [
      ...
      { "icon":"slide_professor_icon.svg", "id":"presenter3_presentation", "content":["presenter","presenter-2"] }
    ]
  }
```

And if you want to add a single stream to show the "presenter-2" video, you can add a `videoSet` to the singleStreamProfilePlugin settings:

```javascript
  "es.upv.paella.singleStreamProfilePlugin": {
    "enabled": true,
    "videoSets": [
      ...
      { "icon":"slide_professor_icon.svg", "id":"presenter3_presentation", "content":["presenter-2"] }
    ]
  }
```


#### source

The admites source types are mp4,ogg,webm,flv,rtmp & image, since all the source types but image share the same JSON structure we will diferenciate between video-source and image-source 

#### video-source

A video-source consist in an array with the videos that forms the diferent resoultions and qualities of the stream, in the example below we have an mp4 source but any of the video types uses this format.

```json
{
  "streams": [
    {
      "sources": {
        "mp4": [
          {
            "src": "",
            "mimetype": "video/mp4",
            "res": {
              "w": 0,
              "h": 0
            }
          },
          .
          .
          .
        ],
      },
      "content": "presenter"
    }
  ]
}
```

* src: The url of the video
* mimetype: mimetype that corresponds to the source
* res: the resolution of the source
    - w: widht
    - h: height
        
#### image-source

When we use an image array as source of the video stream the way this should be represented in the JSON is this:

```json
{
  "streams": [
    {
      "sources": {
        "image": [
          {
            "type": "image/bmp",
            "frames": [
              {
                "time": 0,
                "src": ""
              },
              .
              .
              .
            ],
            "count": 0,
            "duration": 0,
            "res": {
              "w": 0,
              "h": 0
            }
          }
        ]
      },
      "content": "presentation"
    }
  ]
}
```

* time: time of the apeareance of this image
* src: url of the image
* count: number of images that compounds the image stream
* duration: the duration of the image stream
* res: the resolution of the source
    - w: widht
    - h: height
        
### frameList

The storyboard uses an array of images wich is defined in the JSON in the frameList

```json
{
  "frameList": [
    {
      "id": "frame_0",
      "mimetype": "image/bmp",
      "time": 0,
      "url": "",
      "thumb": ""
    },
    .
    .
    .
  ]
}
```

* id: frame_n where n corresponds with the order of the frame.
* mimetype: mimetype of the image
* time: time (in seconds) that corresponds to this frame 
* url: url of the image
* thumb: url of the thumb of the image

### subtitles

```json
	"captions": [
		{
			"lang": "es",
			"text": "Español (traducción automática)",
			"format": "dfxp",
			"url": "be0c7738-039d-9445-8237-8b85f37cd303.es.dfxp"
		},
		{
			"lang": "en",
			"text": "English (automatic transciption)",
			"format": "dfxp",
			"url": "be0c7738-039d-9445-8237-8b85f37cd303.en.dfxp"
		},
		{
			"lang": "ca",
			"text": "Valencià/Català (traducció automàtica)",
			"format": "dfxp",
			"url": "be0c7738-039d-9445-8237-8b85f37cd303.ca.dfxp"
		}
	]
}
```
