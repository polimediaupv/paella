---
---

# Download a precompiled Paella player

You can download a precompiled paella player from `github releases` or downlod it using `bower`

## Download from github releases

You can download paella from [github releases](https://github.com/polimediaupv/paella/releases) 
or latest stable version from [https://github.com/polimediaupv/paella/releases/latest](https://github.com/polimediaupv/paella/releases/latest)

## Download from bower
### Dependencies

If you want to use a stable version of Paella Player, you can download it using Bower. To do it, you'll need to install [Node.js](https://nodejs.org). Download and install it following the instructions for your specific platform:

[https://nodejs.org/en/download](https://nodejs.org/en/download)

After that, install bower using the Node.js package manager. Using the command line, run the following command:

#### macOS / Linux / Unix

```shell
sudo npm install -g bower
```

#### Windows

```shell
npm install -g bower
```

And then, you can use bower to download Paella Player:

```shell
cd /path/to/paella/folder
bower install paella
```

Bower will download Paella Player in your current folder, inside a new directory named `bower_components`. 
Inside this directory, you'll find a specific directory for the Paella Player, containing the compiled player and some examples.


## Test Paella

To test Paella you need to put the files you downloaded in a web server. You can *not* open the index.html file from
a local folder.

If you don't have a web server to test you ned to download one ([nginx](https://nginx.org/),
[apache](https://httpd.apache.org/), ...) or you can create one easyly with python.

Run this command from the paella folder and navigate to `http://localhost:8000`

```shell
python -m SimpleHTTPServer 8000
```


