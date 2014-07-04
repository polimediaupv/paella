# Basic Usage #

## How to integrate paella ##

In your html page:

``` HTML
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8;">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Paella Engage Example</title>
  </head>
  <body>
  </body>
</html>
```

Add the paella css and js dependecies:

``` HTML
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8;">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Paella Engage Example</title>

    <link rel="stylesheet" href="resources/style/controls.css" type="text/css" media="screen" charset="utf-8">
    <link rel="stylesheet" href="resources/style/editor.css" type="text/css" media="screen" charset="utf-8">
    <link rel="stylesheet" href="resources/bootstrap/css/bootstrap.slate.min.css" type="text/css" media="screen" charset="utf-8">

    <script type="text/javascript" src="javascript/base.js"></script>
    <script type="text/javascript" src="javascript/jquery.js"></script>
    <script type="text/javascript" src="javascript/paella_player.js"></script>
    <script type="text/javascript" src="resources/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="example.js"></script>
  </head>
  <body>
  </body>
</html>
````

Then add the container where paella is going to load:

``` HTML
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8;">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Paella Engage Example</title>

    <link rel="stylesheet" href="resources/style/controls.css" type="text/css" media="screen" charset="utf-8">
    <link rel="stylesheet" href="resources/style/editor.css" type="text/css" media="screen" charset="utf-8">
    <link rel="stylesheet" href="resources/bootstrap/css/bootstrap.slate.min.css" type="text/css" media="screen" charset="utf-8">

    <script type="text/javascript" src="javascript/base.js"></script>
    <script type="text/javascript" src="javascript/jquery.js"></script>
    <script type="text/javascript" src="javascript/paella_player.js"></script>
    <script type="text/javascript" src="resources/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="example.js"></script>
  </head>
  <body>
    <div id="playerContainer" style="display:block;width:100%"></div>
  </body>
</html>
```

Finally load Paella using that container:

``` HTML
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8;">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Paella Engage Example</title>

    <link rel="stylesheet" href="resources/style/controls.css" type="text/css" media="screen" charset="utf-8">
    <link rel="stylesheet" href="resources/style/editor.css" type="text/css" media="screen" charset="utf-8">
    <link rel="stylesheet" href="resources/bootstrap/css/bootstrap.slate.min.css" type="text/css" media="screen" charset="utf-8">

    <script type="text/javascript" src="javascript/base.js"></script>
    <script type="text/javascript" src="javascript/jquery.js"></script>
    <script type="text/javascript" src="javascript/paella_player.js"></script>
    <script type="text/javascript" src="resources/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="example.js"></script>
  </head>
  <body>
    <div id="playerContainer" style="display:block;width:100%"></div>
    <script>
      loadPaella('playerContainer');
    </script>
  </body>
</html>
```

## The loadPaella function ##

The loadPaella function can be called with different parameters:

1. loadPaella(containerId)

  The basic call. this loads paella in a div width id = {containerId} and loads the default config file located at config/config.json


2. loadPaella(containerId, repository)

  This loads paella in a div width id = {containerId} and loads the default config file located at config/config.json, but you can specify the {repository} path.
  Example:

``` js
loadPaella('playercontainer', 'http://my.server.com/paella/repository')
````

3. loadPaella(containerId, config, repository)

  This loads paella in a div width id = {containerId}, but instead of loading the the default config file you can provide the config inline. You can  also specify the {repository} path.
  Example:

``` js
loadPaella('playercontainer', {...config...}, 'http://my.server.com/paella/repository')
```
