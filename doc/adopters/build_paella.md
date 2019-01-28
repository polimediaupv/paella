---
---

# Build Paella from source
## Dependencies

In addition to Node.js and Bower, Paella Player uses [Gulp](http://gulp.com/) as a task runner and build system. You can use npm to install Gulp in your system:

### macOS / Linux / Unix

```shell
sudo npm install -g gulp
```

### Windows

```shell
npm install -g gulp
```

Finally, we need to install the gulp modules needed by Paella. Open the terminal and go to the folder you have downloaded paella player.
Now, run the next command:

```	shell
npm install
```

Congratulations, you have all the dependencies installed.	

## Build Paella Player

To build paella player you need to open a terminal and go to the paella folder, and run:

```shell
gulp build.release
```
	
A new folder (named `build`) will be created with the player and a test repository. You will find paella at `build/player`.


## Test Paella

You can test Paella by running the command:

```shell
gulp server.release
```

This command will build paella and launch a local server with paella. You can open a browser and navigate to [http://localhost:8000](http://localhost:8000).

This command also is watching for changes in paella sorce code and if any file changes, rebuild paella itself. It's very usefull while developing paella or any plugin.
