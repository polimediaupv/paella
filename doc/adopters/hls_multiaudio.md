---
---

# Multiple audio with HLS

## Background

Paella Player allows you to use several video and audio streams simultaneously. The sound source must be one of the audio or video streams. It is not allowed to play the audio of more than one stream simultaneously, as this causes incompatibility problems with some mobile browsers,which only allow the playback of more than one video if only one of them has audio.

This was the case until Apple released iPadOS 13 in the fall of 2019. In this version, the Safari web browser behaves in a way that makes it impossible to continue using multiple audio streams. On the one hand, Safari behaves like a desktop browser, making operation very similar to the macOS version. But on the other hand, the JavaScript APIs for media playback still have serious limitations. The biggest limitation is that it's impossible to control the volume or mute a video, so if you play multiple video streams that all have audio, you'll hear the sound from all of them at once.

To make matters worse, App Store publishing rules expressly prohibit the use of other web rendering engines, so all browsers that are available for iOS and iPadOS end up using the same WebKit framework that Safari uses, and therefore have the same behavior. For more information, see section 2.5.6 of [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines):

**2.5.6 Apps that browse the web must use the appropriate WebKit framework and WebKit Javascript.**


Since the beginning of the Paella Player project, we have had constant problems with mobile platforms in general, both with iOS and Android. The problem is that this time we haven't found any possible way to provide multiple audio streams the way it was done until now. 

However, support for multiple audio tracks is a widely used feature, and is supported by all major browsers, both on computers and on tablets and mobile phones. This support will not be removed in the future, as it is widespread. For this reason, the solution is to adapt the Paella Player to the standards of multiple audios.

## New multiple audio support

Starting with Paella Player 6.4, support for multiple audio streams, and multiple video streams with audio is deprecated. Only one video stream with audio may exist, and all other video streams must not include any audio track. Besides this, the only case in which it will be allowed to use audio streams is to generate videos formed by an audio stream and an image sequence.

The pre-6.4 audio support will not be removed, but it will not be maintained either, so if in future web browser versions it stops working, we will not make any effort to fix it, because in fact, in iPadOS it is already impossible to fix it.

The new audio APIs have been implemented in a way that is agnostic to the underlying technology being used. The new functions are integrated into the video object wrapper:

**supportsMultiaudio()**: Return a promise. The result of the promise will be true if the video includes more than one audio stream

**getAudioTracks()**: Returns a promise with an array that includes the information of all audio streams. The most relevant attributes of each of the elements in the array are:

* id: Track identifier
* lang: Track language
* name: Descriptive name of the track, usually using the name of the language.
* groupId: Descriptive name of the audio track group.

Note: these attributes are extracted directly from the attributes used in the HLS playlists.

**setCurrentAudioTrack(trackId)**: Sets the current audio track to be used.

**getCurrentAudioTrack()**: Returns the complete information of the audio track being played.


To access the video wrapper that is being used to play the audio, we can use the `mainVideoPlayer` function of the `streamProvider` object:

```javascript
paella.player.videoContainer.streamProvider.mainVideoPlayer
```

The main video player will be the one that is marked with a master role in the `data.json` video manifest:

```json
"streams": [
    {
        "sources": {
            ...
        },
        ...
        "role": "master"
    }
]
```

## How to use multi audio videos

To use the new video APIs, you only need to provide a video, marked with the `master` role in `data.json` file, that has several audio streams.

Currently, the only video plugin that has adapted to the new APIs is HLSPlayer, partly because it is the only format that supports multiple audios on all platforms supported by Paella Player. However, it would be possible to add this support for other plugins, implementing the functions described in the previous section

The audio selection plugin `en.upv.paella.audioSelector` is able to automatically distinguish whether the video is using the legacy APIs or the new APIs, so there is no need to configure anything on this side. This also provides the ability to serve videos that use the legacy APIs along with videos that use the new APIs, on the same server and with the same player settings.

## An example implementation

It is recommended to serve the HLS videos via a streaming server, such as [Wowza](https://www.wowza.com) ([you can see here instructions on how to generate a smil file with multiple audios](https://www.wowza.com/docs/how-to-use-alternative-audio-or-video-tracks-with-apple-hls-streams)), but it is also possible to generate the files of a m3u8 playlist so that they can be served directly on an HTTP server. Below are the steps to do this test from a video with several associated audio files.

### Use ffmpeg to generate the m3u8 playlists

We start with three files:

* presenter.mp4
* audio-es.m4a
* audio-en.m4a

The following line generates an `out.ts` file that includes the video and the two audios. This is where we must set the encoding parameters (resolution, bitrate, etc).

```bash
ffmpeg -i presenter.mp4 -i audio-es.m4a -i audio-en.m4a \
    -threads 0 -muxdelay 0 -y \
    -map 0:v -map 1 -map 2 -pix_fmt yuv420p -movflags +faststart -r 24 -g 48 -refs 1 \
    -vcodec libx264 -acodec aac -profile:v baseline -level 30 -ar 44100 -ab 64k -f mpegts out.ts
```

Then, starting from the file out.ts, three directories are created to place the chunks of the streams together with the playlist m3u8 corresponding to each of them.

```bash
mkdir -p video
mkdir -p audio-es
mkdir -p audio-en
ffmpeg -i out.ts -threads 0 -muxdelay 0 -y -map 0:v -vcodec copy -f hls -hls_time 1 -hls_list_size 0 video/index.m3u8
ffmpeg -i out.ts -threads 0 -muxdelay 0 -y -map 0:a:0 -codec copy -f segment -segment_time 1 -segment_list_size 0 -segment_list audio-es/audio-es.m3u8 -segment_format mpegts audio-es/audio-es_%d.aac
ffmpeg -i out.ts -threads 0 -muxdelay 0 -y -map 0:a:1 -codec copy -f segment -segment_time 1 -segment_list_size 0 -segment_list audio-en/audio-en.m3u8 -segment_format mpegts audio-en/audio-en_%d.aac
```

After this, we can discard the `out.ts` file, and we'll have three directories with the playlists and all their chunks.

Finally, we create a general playlist file, which refers to each of the playlists we have generated:

**presenter.m3u8**:

```m3u8
#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",LANGUAGE="es",NAME="Spanish",DEFAULT=YES,AUTOSELECT=YES,URI="audio-es/audio-es.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",LANGUAGE="en",NAME="English",DEFAULT=NO,AUTOSELECT=YES,URI="audio-en/audio-en.m3u8"
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=207230,AUDIO="stereo",RESOLUTION=1920x1080
video/index.m3u8
```

This file, along with the three directories, can be used as the source for the video. We can place it, along with a PaellaPlayer video manifest similar to the one below:

**data.json**:

```json
{
	"metadata": {
		"duration": 228,
        "title": "HLS multiaudio",
		"preview": "https://repository.paellaplayer.upv.es/hls-multiaudio/preview.jpg"
	},
	"streams": [
		{
			"sources": {
				"hls": [
					{
						"src": "presenter.m3u8",
						"mimetype": "video/mp4"
					}
				]
			},
			"content":"presenter",
			"role": "master"
		}
	]
}
```
