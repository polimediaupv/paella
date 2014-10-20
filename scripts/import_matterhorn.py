#!/usr/bun/python

from argparse import ArgumentParser
import urllib
import pycurl
import cStringIO
import json
import re
import os, sys, errno

def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise



def getEpisodeFromMatterhorn(engageServer, episodeId, useAuth=False, digestUser=None, digestPassword=None):
	buf = cStringIO.StringIO()

	fullurl = engageServer + "/search/episode.json?" + urllib.urlencode({'id':episodeId})

	curl = pycurl.Curl()
	curl.setopt(curl.URL, fullurl)
	if (useAuth):
		curl.setopt(curl.HTTPAUTH, curl.HTTPAUTH_DIGEST)
		curl.setopt(curl.USERPWD, digestUser+":"+digestPassword)
		curl.setopt(curl.HTTPHEADER, ["X-Requested-Auth: Digest", "X-Opencast-Matterhorn-Authorization: true"])
	curl.setopt(curl.WRITEFUNCTION, buf.write)
	curl.perform()
	curl.close()
	
	jsonResult = json.loads(buf.getvalue())
	buf.close();
	
	try:
		return jsonResult["search-results"]["result"];
	except:
		return {}


def downloadFileTo(url, destination):
	print url
	fp = open(destination, "wb")
	curl = pycurl.Curl()
	curl.setopt(curl.URL, url)
	curl.setopt(curl.WRITEDATA, fp)
	curl.perform()
	curl.close()
	fp.close()	
	


def importLocal(localFolder, url, saveLocal):
	retUrl = url
	
	if (saveLocal and (not re.match("^rtmp", url))):
		arr = url.split("/")
	
		folderName = arr[len(arr)-2]
		fileName = arr[len(arr)-1]
		folder = os.sep.join([localFolder, folderName]);
		downfile = os.sep.join([folder, fileName])
		mkdir_p(folder)
		
		print "Downloading " + url
		urllib.urlretrieve(url, filename=downfile)
		
		retUrl = os.sep.join([folderName, fileName])
	
	return retUrl


def dumpEpisodeToFolder(episodeMH, saveTo, saveLocal):
	episodeFolder = os.sep.join([saveTo, episodeMH['mediapackage']['id']])	
	mkdir_p(episodeFolder)



	tracksMH = episodeMH['mediapackage']['media']['track']
	if type(tracksMH) is not list:
		tracksMH = [tracksMH]
	attachmentsMH = episodeMH['mediapackage']['attachments']['attachment']
	if type(attachmentsMH) is not list:
		attachmentsMH = [attachmentsMH]


	try:
		license = episodeMH['mediapackage']['license']
	except:
		license = ""
	episode = {
		"version": "1.0.0",
	    "mediapackage": {
	        "metadata": {
		        "duration": episodeMH['mediapackage']['duration'],
		        "start": episodeMH['mediapackage']['start'],
		        "title": episodeMH['mediapackage']['title'],
		        "license": license,
		        "creators": []
	        },    
	        "media": {
	            "tracks": []
	        },
	        "slides": []
	    }
	}

	## Read tracks
	for trackMH in tracksMH:
		track = {
					"id": trackMH['id'],
					"type": trackMH['type'],
					"mimetype": trackMH['mimetype'],
					"tags": [],
					"url": importLocal(episodeFolder, trackMH['url'], saveLocal),
					"preview": "",
					"mediainfo": {}
				};


		for attachMH in attachmentsMH:
			if (attachMH['type'] == track['type'].split("/")[0] + '/player+preview'):
				track['preview'] = importLocal(episodeFolder, attachMH['url'], saveLocal)

		try:
			track['mediainfo']["audio"] = trackMH['audio']
		except:
			pass
		try:
			track['mediainfo']["video"] = trackMH['video']
		except:
			pass

		episode['mediapackage']['media']['tracks'].append(track);
		

	## Read attachments	
	slides= {};
	for attachMH in attachmentsMH:
		if (attachMH['type'] == 'presentation/segment+preview'):		
			time = re.search(';time=T(\d+:\d+:\d+)', attachMH['ref']).group(1)

			try:
				slides[time]
			except:
				slides[time] = {}
				
			slides[time]["mimetype"] = attachMH['mimetype']
			slides[time]["time"] = time

			slides[time]["thumb"] = {
										"resolution": "",
										"url": importLocal(episodeFolder, attachMH['url'], saveLocal)
									}

		elif (attachMH['type'] == 'presentation/segment+preview+hires'):
			time = re.search(';time=T(\d+:\d+:\d+)', attachMH['ref']).group(1)

			try:
				slides[time]
			except:
				slides[time] = {}
				
			slides[time]["mimetype"] = attachMH['mimetype']
			slides[time]["time"] = time

			slides[time]["slide"] = {
										"resolution": "",
										"url": importLocal(episodeFolder, attachMH['url'], saveLocal)
									}


	for key, value in slides.items():
		episode['mediapackage']['slides'].append(value)



	episodeContent = json.dumps(episode, indent=4, separators=(',', ': '))
	
	episodeFileName = os.sep.join([saveTo, episodeMH['mediapackage']['id'], "episode.json"])
	episodeFile = open(episodeFileName, "w")
	episodeFile.write(episodeContent)
	episodeFile.close()




	#print json.dumps(episode, indent=4, separators=(',', ': '))


def main():	
	parser = ArgumentParser(description='Import MediaPackages from Matterhorn Installation')


	parser.add_argument('--engageServer', action='store', dest='engageServer', default='http://localhost:8080', help='Matterhorn engage server URL.')
	parser.add_argument('--use-auth', action='store_true', dest='useAuth', default=False,  help='')
	parser.add_argument('--digestUser', action='store', dest='digestUser', default='matterhorn_system_account', help='Matterhorn digest user.')
	parser.add_argument('--digestPassword', action='store', dest='digestPassword', default='CHANGE_ME', help='Matterhorn digest password.')

	parser.add_argument('--episode', action='store', dest='episode', help='Matterhorn episode ID.')


	parser.add_argument('--saveTo', action='store', dest='saveTo', default='.',  help='Folder where to export the episode.')
	parser.add_argument('--copy-local', action='store_true', dest='saveLocal', default=False,  help='')


	args = parser.parse_args()

	if (args.episode == None):
		print "None"
		sys.exit(1);


	print "Retrieving episode " + args.episode + " from " + args.engageServer + " engage server"
 	episode = getEpisodeFromMatterhorn(args.engageServer, args.episode, args.useAuth, args.digestUser, args.digestPassword)
 	
 	if (episode.has_key('mediapackage')):
 		dumpEpisodeToFolder(episode, args.saveTo, args.saveLocal)
 		pass
 	else:
 		print "No MediaPackage Found!"



if __name__ == '__main__':
	main()