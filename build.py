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

for file in paellaFiles:
    jsPath = paellaDir + file
    print jsPath
    jsOut.write(open(jsPath).read())
    jsOut.write('\n\n')

pluginFiles = os.listdir(pluginDir);

f = open(pluginDir + 'ignore.json')
ignoreFiles = json.loads(f.read())


for file in pluginFiles:
	jsPath = pluginDir + file
	fileName, fileExtension = os.path.splitext(jsPath);
	cssPath = fileName + '.css'
	if fileExtension=='.js' and not(file in ignoreFiles):
		print fileName
		jsOut.write(open(jsPath).read())
		jsOut.write('\n\n')
		if os.path.exists(cssPath):
			cssOut.write(open(cssPath).read())
			cssOut.write('\n\n')
jsOut.close()
cssOut.close()


if args.minimize:
	command = "java -jar yuicompressor.jar " + javascriptFile + " -o " + javascriptFile
	f=os.popen(command)
	for line in f.readlines():
		print line
	

