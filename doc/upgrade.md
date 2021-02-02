---
---

# Upgrade Paella Player

## Upgrading from paella 6.2.x to 6.3.x

In principle it should not be necessary to modify anything to upgrade to version 6.3.x. However, video360 videos, which were an unsupported test feature in previous version, are now supported in Paella 6.3.x, but are defined using the new videoCanvas feature.

- Video360 streams no longer exist. Instead, a normal video stream is used (currently mp4 and hls streams are implemented).
- For the video to be represented with the 360º viewer, a 'video360' canvas is used for the equirectangular format, and 'video360theta' for the raw format of the Ricoh Theta S camera.

```json
"streams": [
		{
			"sources": {
				"mp4": [
					{
						"src": "https://repository.paellaplayer.upv.es/video360/video360.mp4",
						"mimetype": "video/mp4",
						"res": {
							"w": "4096",
							"h": "2046"
						}
					}
				]
			},
			"preview": "https://repository.paellaplayer.upv.es/belmar-multiresolution/preview/presenter_cut.jpg",
			"content":"presenter",
			"canvas":["video360"]
		}
	],
```

## Multi audio support in Paella 6.4.x

As of version 6.4.0 a new system based on HLS playlists is used to supply various audio streams. You can see the documentation about it in [this link](adopters/hls_multiaudio.md)


## Improvements in HLS live streams

Some changes have been made to the HLS plugin that improve the compatibility of live streams. We think we have identified all the problems that may arise from this change, but it is advisable to check the behavior of browsers when the video is set to autoplay mode.
