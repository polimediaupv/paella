# Using the data JSON format

To make easier the use of paella from third parties we have created a [JSON schema](https://github.com/polimediaupv/paella/blob/develop/tools/mediapackagecreator/paella.schema.json) this way we have a standar data format to load streams into paella with the load function. 

```javascript
 paella.load('playerContainer',{ data:dataJSON })
```

To make this even easier we made this [tool](https://rawgit.com/polimediaupv/paella/develop/tools/mediapackagecreator/jsoncreateutil.html) to define our JSONs 
 
#JSON Structure
 We will detail the JSON structure from the root
 ```json
 {
  "streams": [],
  "frameList": [],
  "metadata": {}
}
```

##streams
This will hold an array with the diferent video streams that the player will play, the max length of this array should be 2, since paella by default can only play 2 video streams.
```json
{
  "streams": [
    {
      "sources": {},
      "preview": ""
    },
    .
    .
    .
  ]
}
```

##stream
Each stream in the stream array will have:
* preview: url containing the image that will be used as preview for the stream
* sources: source or sources of the data stream 

##source
The admites source types are mp4,ogg,webm,flv,rtmp & image, since all the source types but image share the same JSON structure we will diferenciate between video-source and image-source 

##video-source
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
      "preview": ""
    }
  ]
}
```

* src: The url of the video
* mimetype: mimetype that corresponds to the source
* res: the resolution of the source
    * w:widht
    * h:height
        
##image-source
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
      "preview": ""
    }
  ]
}
```

* time: time of the apeareance of this image
* src: url of the image
* count: number of images that compounds the image stream
* duration: the duration of the image stream
* res: the resolution of the source
    * w:widht
    * h:height
        
#frameList
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

 
 #metadata
 here we store custom info about the videos that we will play
 
 ```json
 {
  "metadata": {
    "title": "",
    "duration": 0
  }
}
```
 
* title: title of the video
* duration: duration of the video
