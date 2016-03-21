# Encoding. Info about compatible video formats

Paella can play diferent video codecs, but the prefered video codec is `MP4`.


## Video codecs

| Container	| video codec | audio codec |
| --- | --- | --- |
| [MP4](https://en.wikipedia.org/wiki/MPEG-4_Part_14) | [MPEG-4 AVC (H.264)](https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC) | [AAC](https://en.wikipedia.org/wiki/Advanced_Audio_Coding) |
| [WEBM](https://en.wikipedia.org/wiki/WebM) | [VP8](https://en.wikipedia.org/wiki/VP8) | [Vorbis](https://en.wikipedia.org/wiki/Vorbis) |
| [OGG](https://en.wikipedia.org/wiki/Ogg) | [Theora](https://en.wikipedia.org/wiki/Theora) | [Vorbis](https://en.wikipedia.org/wiki/Vorbis) |

## MP4 and the moov atom

H.264 encoded videos carry their metadata (`duration, frame rate, etc...`) in the so called `moov atom`.

By default encoding programs will insert the moov atom at the end of the video file which is suitable
for playback of a local file in a desktop program. However, any kind of progressive download *requires*
the metadata to be available right away for immediate playback. 
Otherwise the player has to wait for the entire video to be downloaded before playback starts.

Make sure to select an option in your transcoding program which puts the moov atom at the *beginning* of the file!

In case you already have a lot of MP4 videos with the moov atom at the end of the file, use a dedicated program such as [QTIndexSwapper](http://renaun.com/blog/code/qtindexswapper/) or [MOOV Relocator](https://code.google.com/archive/p/moovrelocator/) to move it to the beginning.


## MP4 for mobile devices

MPEG-4 AVC is a powerful codec which allows very effective compression at various profiles and levels.
As higher profiles and levels are decoding intensive, they are not supported by mobile devices to
ease their processor workload.

When posible encode your videos with:
* Baseline Profile
* Level 3.0
* 1 reference frame
