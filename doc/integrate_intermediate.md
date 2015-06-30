# Integrate Paella in your portal: the intermediate way

To integrate Paella into your own HTML page, follow this guide:

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

		<script type="text/javascript" src="javascript/swfobject.js"></script>
		<script type="text/javascript" src="javascript/base.js"></script>
		<script type="text/javascript" src="javascript/jquery.js"></script>
		<script type="text/javascript" src="javascript/lunr.min.js"></script>
		<script type="text/javascript" src="javascript/require.js"></script>
		<script type="text/javascript" src="javascript/paella_player.js"></script>

		<script type="text/javascript" src="resources/bootstrap/js/bootstrap.min.js"></script>
		<link rel="stylesheet" href="resources/bootstrap/css/bootstrap.slate.min.css" type="text/css" media="screen" charset="utf-8">
		<link rel="stylesheet" href="resources/style/style_dark.css" id="paellaSkin" type="text/css" media="screen" title="no title" charset="utf-8">
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

		<script type="text/javascript" src="javascript/swfobject.js"></script>
		<script type="text/javascript" src="javascript/base.js"></script>
		<script type="text/javascript" src="javascript/jquery.js"></script>
		<script type="text/javascript" src="javascript/lunr.min.js"></script>
		<script type="text/javascript" src="javascript/require.js"></script>
		<script type="text/javascript" src="javascript/paella_player.js"></script>

		<script type="text/javascript" src="resources/bootstrap/js/bootstrap.min.js"></script>
		<link rel="stylesheet" href="resources/bootstrap/css/bootstrap.slate.min.css" type="text/css" media="screen" charset="utf-8">
		<link rel="stylesheet" href="resources/style/style_dark.css" id="paellaSkin" type="text/css" media="screen" title="no title" charset="utf-8">
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

		<script type="text/javascript" src="javascript/swfobject.js"></script>
		<script type="text/javascript" src="javascript/base.js"></script>
		<script type="text/javascript" src="javascript/jquery.js"></script>
		<script type="text/javascript" src="javascript/lunr.min.js"></script>
		<script type="text/javascript" src="javascript/require.js"></script>
		<script type="text/javascript" src="javascript/paella_player.js"></script>

		<script type="text/javascript" src="resources/bootstrap/js/bootstrap.min.js"></script>
		<link rel="stylesheet" href="resources/bootstrap/css/bootstrap.slate.min.css" type="text/css" media="screen" charset="utf-8">
		<link rel="stylesheet" href="resources/style/style_dark.css" id="paellaSkin" type="text/css" media="screen" title="no title" charset="utf-8">
  </head>
  <body>
    <div id="playerContainer" style="display:block;width:100%"></div>
    <script>
      paella.load('playerContainer', {});
    </script>
  </body>
</html>
```

## The paella.load function

The paella.load function accepts two parameters

```js
paella.load(containerId, options)
```

- containedId

  This is the ID con the div container where paella will load
  
- options

  options is a object that can accept diferent parameters:
  
  * url
    
    The URL of the repository. If a repository URL is passed here, paella will ignore the url 
    specified in the `config.json` file.

    ``` js
    paella.load(containerId, { url:'../repository/' });
    ```

  * data
  
    A data object with the video information. To know more about the data format, please read
    the [data.json format](integrate_datajson.md) section.

    ``` js
    var data = { ... } // a data.json object
    paella.load(containerId, { data: data });
    ```

