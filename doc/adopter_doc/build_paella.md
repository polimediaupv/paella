# Build and install from source

In this section we are going to explain how to build and install Paella Player.

## Dependencies

Paella Player uses [Gulp](http://gulp.com/) as a task runner. so we need to install some dependencies:

1. [Node Js](http://nodejs.org/)
2. [Gulp Js](http://gulpjs.com/)

First we are goint to install [Node Js](http://nodejs.org/) in our system. To do so, go to [http://nodejs.org/](http://nodejs.org/) and download and install nodejs.
Now we have the node and npm command installed.

Now, we are going to install the other dependencies. To do so open a terminal and run the next command:

	$ npm -g install gulp
	
If you are in a OSX/Linux machine, run that command with sudo:

	$ sudo npm -g install gulp


Finally, we need to install the gulp modules needed by Paella. Open the terminal and go to the folder you have downloaded paella player.
Now, run the next command:

	$ npm install

Congratulations, you have all the dependencies installed.	



## Build Paella Player

To build paella player you need to open a terminal and go to the paella folder, and run:

	$ gulp build.release
	
A new folder (called 'build') will be created	with the player and a test repository. You will find paella at 'build/player'.


## Test Paella

You can test Paella by running the command:

	$ gulp server.release

This command will build paella and launch a local server with paella. You can open a browser and navigate to [http://localhost:8000](http://localhost:8000).

This command also is watching for changes in paella sorce code and if any file changes, rebuild paella itself. It's very usefull while developing paella or any plugin.
