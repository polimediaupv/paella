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
arguments.add_argument('--debug',action='store_true',help='do not minimize output javascript code')
arguments.add_argument('--install',action='store_true',help='generate production output files')
arguments.add_argument('--noplugins',action='store_true',help='add plugins')

intermediatePath = 'tmp'
if (not os.path.exists(intermediatePath)):
	os.makedirs(intermediatePath)
	
args = arguments.parse_args()
if args.src:
	pluginDir = args.src

if args.js:
	javascriptFile = args.js

if args.css:
	cssFile = args.css

if args.install:
	jsOut = open(javascriptFile,'w')
	cssOut = open(cssFile,'w')
else:
	jsOut = open(os.path.join(intermediatePath,'javascript_output.o'),'w')
	cssOut = open(os.path.join(intermediatePath,'css_output.o'),'w')

paellaFiles = os.listdir(paellaDir)
paellaFiles.sort()

for file in paellaFiles:
	outPath = os.path.join(intermediatePath,file)
	outFile = open(outPath,'w')
	jsPath = paellaDir + file
	outFile.write(open(jsPath).read())
	outFile.write('\n\n')
	outFile.close()

pluginFiles = os.listdir(pluginDir)
pluginFiles.sort()

f = open(pluginDir + 'ignore.json')
ignoreFiles = json.loads(f.read())

if not args.noplugins:
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
intermediateFiles.sort()

for file in intermediateFiles:
	filePath = os.path.join(intermediatePath,file)
	fileName, fileExtension = os.path.splitext(filePath)
	if not args.debug and fileExtension=='.js':
		command = "java -jar yuicompressor.jar " + filePath + " -o " + filePath
		print command
		subprocess.check_call(command,shell=True)
	print "adding " + filePath + " to " + javascriptFile
	jsOut.write(open(filePath).read())

jsOut.close()
shutil.rmtree(intermediatePath)

