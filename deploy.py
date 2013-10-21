#! /usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import subprocess
import shutil
import json
import argparse
from subprocess import call

def copyFilesInArray(sourcePrefix,sourceArray,destination):
    for src in sourceArray:
        dstPath = os.path.join(sourcePrefix, src)
        dstPath = os.path.join(destination, dstPath)
        srcPath = os.path.join(sourcePrefix,src)
        if not srcPath.startswith("."):
            print("copy " + srcPath + " to " + dstPath)
            if (os.path.isfile(srcPath)):
                shutil.copy(srcPath,dstPath)
            elif os.path.exists(dstPath):
                shutil.rmtree(dstPath)
                shutil.copytree(srcPath,dstPath)
            else:
                shutil.copytree(srcPath,dstPath)
    

parser = argparse.ArgumentParser()
parser.add_argument("destination",help="Deployment location: output path to place the Paella Player files")
parser.add_argument("-p","--plugins",help="Copy plugins: will update and overwrite the plugin files.",type=int,choices=[0,1],default=1)
parser.add_argument("-i","--install",help="Copy installation files: will also copy the installation, configuration and default library files",type=int,choices=[0,1],default=0)
parser.add_argument("-s","--sample",help="Copy sample files: will also copy the sample html and javascript files.",type=int,choices=[0,1],default=0)
parser.add_argument("-d","--debug",help="Copy debug files: will update and overwrite the debug files.",type=int,choices=[0,1],default=0)

args = parser.parse_args()

paella = []
debug = []
plugins = []
sample = []

# Paella Engage files
paella.append("javascript/base.js")
paella.append("javascript/jquery.js")
paella.append("javascript/jquery.sparkline.min.js")
paella.append("javascript/paella_player.js")
paella.append("resources")
paella.append("player.swf")

# plugins
plugins = os.listdir('plugins')

# installation files
configFolder = os.listdir('config')


# sample
sample.append("index.html")
sample.append("example.js")
sample.append("extended.html")
sample.append("debug.html")
sample.append("extended_debug.html")

# debug
debug.append("src")
debug.append("build.py")
debug.append("yuicompressor.jar")



# it checks if the destination web folder exists, and creates it if not
dstJs = os.path.join(args.destination,"javascript")
if not os.path.exists(dstJs):
    os.makedirs(dstJs)
    
dstPlugins = os.path.join(args.destination,"plugins")
if not os.path.exists(dstPlugins):
    os.makedirs(dstPlugins)
    
dstConfig = os.path.join(args.destination,"config")
if not os.path.exists(dstConfig):
    os.makedirs(dstConfig)
if "config.json" in configFolder:
    configFolder.remove("config.json")


if (args.install==1):
    configDstPath = os.path.join(args.destination,"config/config.json")
    shutil.copy("config/config.json.default",configDstPath)

copyFilesInArray("",paella,args.destination)
copyFilesInArray("config",configFolder,args.destination)

if (args.plugins==1):
    copyFilesInArray("plugins",plugins,args.destination)

if (args.sample==1):
    copyFilesInArray("",sample,args.destination)
    
if (args.debug==1):
    copyFilesInArray("",debug,args.destination)

