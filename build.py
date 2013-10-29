#! /usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import subprocess
import shutil
import json
import argparse
from subprocess import call


pluginDir = 'plugins/'
paellaDir = 'src/'
javascriptFile = 'javascript/paella_player.js'
cssFile = 'plugins/plugins.css'

arguments = argparse.ArgumentParser(description="Compile plugins, javascript and style sheet files.")
arguments.add_argument('--src',help='Source directory')
arguments.add_argument('--js',help='Javascript output file, with path')
arguments.add_argument('--css',help='Stylesheet output file, with path')
arguments.add_argument('--minimize',action='store_true',help='minimize output javascript code')

args = arguments.parse_args()
if args.src:
	pluginDir = args.src

if args.js:
	javascriptFile = args.js

if args.css:
	cssFile = args.css

jsOut = open(javascriptFile,'w')
cssOut = open(cssFile,'w')

paellaFiles = os.listdir(paellaDir)
paellaFiles.sort()

intermediatePath = 'tmp'
if (not os.path.exists(intermediatePath)):
	os.makedirs(intermediatePath)

for file in paellaFiles:
	outPath = os.path.join(intermediatePath,file)
	outFile = open(outPath,'w')
	jsPath = paellaDir + file
	outFile.write(open(jsPath).read())
	outFile.write('\n\n')
	outFile.close()

pluginFiles = os.listdir(pluginDir);

f = open(pluginDir + 'ignore.json')
ignoreFiles = json.loads(f.read())


for file in pluginFiles:
	jsPath = pluginDir + file
	fileName, fileExtension = os.path.splitext(jsPath);
	cssPath = fileName + '.css'
	if fileExtension=='.js' and not(file in ignoreFiles):
		outPath = os.path.join(intermediatePath,file)
		outFile = open(outPath,'w')
		outFile.write(open(jsPath).read())
		outFile.write('\n\n')
		outFile.close()
		if os.path.exists(cssPath):
			cssOut.write(open(cssPath).read())
			cssOut.write('\n\n')
cssOut.close()


intermediateFiles = os.listdir(intermediatePath)
for file in intermediateFiles:
	filePath = os.path.join(intermediatePath,file)
	if args.minimize:
		command = "java -jar yuicompressor.jar " + filePath + " -o " + filePath
		print command
		subprocess.check_call(command,shell=True)
	print "adding " + filePath + " to " + javascriptFile
	jsOut.write(open(filePath).read())

jsOut.close()
shutil.rmtree(intermediatePath)

