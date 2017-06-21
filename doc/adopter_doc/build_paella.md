# Download Paella Player
## Download precompiled stable version
### Dependencies

If you want to use a stable version of Paella Player, you can download it using Bower. To do it, you'll need to install [Node.js](https://nodejs.org). Download and install it following the instructions for your specific platform:

[https://nodejs.org/en/download](https://nodejs.org/en/download)

After that, install bower using the Node.js package manager. Using the command line, run the following command:

#### macOS / Linux / Unix

```
	sudo npm install -g bower
```

#### Windows

```
	npm install -g bower
```

And then, you can use bower to download Paella Player:

```
	cd /path/to/paella/folder
	bower install paella
```

Bower will download Paella Player in your current folder, inside a new directory named "bower_components". Inside this directory, you'll find a specific directory for the Paella Player, containing the compiled player and some examples.


## Build and install from source
### Dependencies

In addition to Node.js and Bower, Paella Player uses [Gulp](http://gulp.com/) as a task runner and build system. You can use npm to install Gulp in your system:

#### macOS / Linux / Unix

```
	sudo npm install -g gulp
```

#### Windows

```
	npm install -g gulp
```

Finally, we need to install the gulp modules needed by Paella. Open the terminal and go to the folder you have downloaded paella player.
Now, run the next command:

```	
	npm install
```

Congratulations, you have all the dependencies installed.	

## Build Paella Player

To build paella player you need to open a terminal and go to the paella folder, and run:

```
	gulp build.release
```
	
A new folder (called 'build') will be created	with the player and a test repository. You will find paella at 'build/player'.


## Test Paella

You can test Paella by running the command:

```
gulp server.release
```

This command will build paella and launch a local server with paella. You can open a browser and navigate to [http://localhost:8000](http://localhost:8000).

This command also is watching for changes in paella sorce code and if any file changes, rebuild paella itself. It's very usefull while developing paella or any plugin.
