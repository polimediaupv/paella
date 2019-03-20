---
---

# Download a precompiled Paella player

You can download a precompiled paella player from `github releases` or downlod it using `npm` or `bower`

## Download from github releases

You can download paella from [github releases](https://github.com/polimediaupv/paella/releases) 
or latest stable version from [https://github.com/polimediaupv/paella/releases/latest](https://github.com/polimediaupv/paella/releases/latest)

## Download from npm

### Dependencies

If you want to use a stable version of Paella Player, you can download it using `npm`. To do it, you'll need to install [Node.js](https://nodejs.org). Download and install it following the instructions for your specific platform:

[https://nodejs.org/en/download](https://nodejs.org/en/download)

After that, download paella player using the npm package manager (included in node):


```shell
	npm install paellaplayer
```

The paella player binaries will be downloaded in the node_modules folder

```shell
	cd node_modules/paellaplayer/build
```

## Test Paella

To test Paella you need to put the files you downloaded in a web server. You can *not* open the index.html file from
a local folder.

If you don't have a web server to test you ned to download one ([nginx](https://nginx.org/),
[apache](https://httpd.apache.org/), ...) or you can create one easyly with python.

Run this command from the paella folder and navigate to `http://localhost:8000`

Python 3.X

```shell
python -m http.server 8000
```

Python 2.X

```shell
python -m SimpleHTTPServer 8000
```

