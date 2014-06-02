#!/usr/bun/python

from argparse import ArgumentParser
import urllib
import pycurl
import cStringIO
import json
import re
import os, sys, errno
import uuid
import shutil


def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise





def getTrack(videoFolder, videoFile, trackType, saveLocal):
	trackId = str(uuid.uuid4())
	videoURL = videoFile
	if (saveLocal and (not re.match("^rtmp", videoFile))):
		arr = videoFile.split("/")
		fileName = arr[len(arr)-1]
		folder = os.sep.join([videoFolder, trackId]);
		downfile = os.sep.join([folder, fileName])
		mkdir_p(folder)
	
		if (re.match("^https?://", videoFile)):			
			print "   Downloading " + videoFile
			urllib.urlretrieve(videoFile, filename=downfile)
			videoURL = os.sep.join([trackId, fileName])
		else:
			print "   Copying file " + videoFile
			shutil.copyfile(videoFile, downfile)
			videoURL = os.sep.join([trackId, fileName])
		
	arr = videoURL.split(".")
	trackMime = "video/" + arr[len(arr)-1].lower()
	
	track = {
		"id": trackId,
		"type": trackType,
		"mimetype": trackMime,
		"tags": [],
		"url": videoURL,
		"preview": "",
		"mediainfo": {}
	};
	return track;
	


def main():	
	parser = ArgumentParser(description='Create episode.json for Paella Player Standalone')

	parser.add_argument('--video-presenter', action='store', dest='videoPresenterFile', help='Presenter Video File.')
	parser.add_argument('--video-presentation', action='store', dest='videoPresentationFile', help='Presentation Video File.')
	parser.add_argument('--title', action='store', dest='title', help='Title.')

	parser.add_argument('--video-id', action='store', dest='videoId', help='Video ID.')

	parser.add_argument('--saveTo', action='store', dest='saveTo', default='.',  help='Folder where to export the episode.')
	parser.add_argument('--copy-local', action='store_true', dest='saveLocal', default=False,  help='')


	args = parser.parse_args()

	if ((args.videoPresenterFile == None) and (args.videoPresentationFile == None)):
		print "No video Files"
		sys.exit(1);
	 

	videoId = args.videoId;
	if (videoId == None):
		videoId = str(uuid.uuid4())
		
	print "Generating Video ID " + videoId
	videoFolder = os.sep.join([args.saveTo, videoId])	
	mkdir_p(videoFolder)

	tracks = []
	
	if (args.videoPresenterFile != None):
		tracks.append(getTrack(videoFolder, args.videoPresenterFile, "presenter/delivery", args.saveLocal))
	if (args.videoPresentationFile != None):
		tracks.append(getTrack(videoFolder, args.videoPresentationFile, "presentation/delivery", args.saveLocal))
	

	episode = {
		"version": "1.0.0",
	    "mediapackage": {
	        "metadata": {
		        "duration": "",
		        "start": "",
		        "title": args.title,
		        "license": "",
		        "creators": []
	        },    
	        "media": {
	            "tracks": tracks
	        },
	        "slides": []
	    }
	}
	
	
	# Save
	episodeContent = json.dumps(episode, indent=4, separators=(',', ': '))
	episodeFileName = os.sep.join([args.saveTo, videoId, "episode.json"])
	episodeFile = open(episodeFileName, "w")
	episodeFile.write(episodeContent)
	episodeFile.close()
	


if __name__ == '__main__':
	main()