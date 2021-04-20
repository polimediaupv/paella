---
---

# paella.Data

Paella provides a homogeneous mechanism to write and read persistent data. paella.Data is implemented based on the Delegate design pattern. It delegates the reading and writting operations on an object that knows where read from and write to data. To setup the delegate objects, you must to implement them and use the paella player's `config.json` file to register them.

``` js
paella.data.write("myContext","key",{data:"my data"},function(response,status) {
  if (status) console.log("data successfully writted");
  else console.log("error writting data");
});

paella.data.read("myContext","key",function(data) {
  console.log(data);
});
```

## paella.DataDelegate

To write and read data to and from your server, you must to implement your specific dataDelegates and link them to one or more context. You can link a data delegate at the same time you define it, or you can link it in the `config.json` file.

To create a data delegate, you have to use the `paella.addDataDelegate()` function with the following parameters:

- context: A string or an array of strings, specifying the context or contexts to which you want to link the data delegate
- factory: A function or closure that will return the class that implements the data delegate.

The data delegate class must extend `paella.DataDelegate`.

Example: cookie-based reader and writter delegate

``` js
paella.addDataDelegate(["myContext"], () => {
  return class CookieDataDelegate extends paella.DataDelegate {
    serializeKey(context,params) {
      if (typeof(params)=='object') {
		params = JSON.stringify(params);
	  }
      return context + '|' + params;
    }
  
    read(context,params,onSuccess) {
      var key = this.serializeKey(context,params);
      var value = paella.utils.cookies.get(key);
      try {
        value = unescape(value);
        value = JSON.parse(value);
      }
      catch (e) {}
      if (typeof(onSuccess)=='function') {
        onSuccess(value,true);
      }
    }
    
    write(context,params,value,onSuccess) {
      var key = this.serializeKey(context,params);
	  if (typeof(value)=='object') {
		value = JSON.stringify(value);
	  }
      value = escape(value);
      paella.utils.cookies.set(key,value);
      if(typeof(onSuccess)=='function') {
        onSuccess({},true);
      }
    }
    
    remove(context,params,onSuccess) {
      var key = this.serializeKey(context,params);
      if (typeof(value)=='object') {
		value = JSON.stringify(value);
	  }
      paella.utils.cookies.set(key,'');
      if(typeof(onSuccess)=='function') {
        onSuccess({},true);
      }
    }
});
```

The data delegate can also be linked to a context in the `config.json` file. If the data delegate is linked at definition and also in the configuration, the configuration will be more prioritary.

Example: link cookie data delegate in config.json

``` js
{
  ...
  "data":{
  	"enabled":true,
  	"dataDelegates":{
  	  "default":"CookieDataDelegate",
  	  "myContext":"CookieDataDelegate"
  	}
  }
}
```

Each context is related with a service that your server can provide. This contexts usually are handled 
by different plugins: for example, the "annotations" service is handled by the Paella Player Annotations
plugin, to show annotations in the video canvas, and also are handled by the Paella Editor Annotation
plugin to create and modify annotations. In a particular case, the server may supply these annotations
by using files, and in other case may supply them using a REST API. The way in wich you must to implement
your DataDelegate class will depend on the way your server provide the data.

The data format that you will receive and send in your DataDelegate will depend on the particular context: 
for example, the "captions" context may expect a format, and the "annotations" context may expect a
different one. Refer to the specific context documentation to know more about its data format.
