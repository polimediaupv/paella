---
---

# User tracking example: google analytics

This plugin saves the usertracking events to the [Google Analitycs](https://www.google.es/intl/es/analytics/) service

To create a user tracking plugin, extend the class paella.userTracking.SaverPlugIn

```javascript

paella.addPlugin(function() {
  return class GoogleAnalyticsTracking extends paella.userTracking.SaverPlugIn {

```

To initialize the tracking service you can use the `setup()` function, the `checkEnabled()` function or both. In this case, the initialization code allows us to check if the service is configured or not, so we use `checkEnabled()` to indicate if the plugin is active and at the same time we initialize the Google Analytics service.

```javascript
  ...

  checkEnabled(onSuccess) {
    var trackingID = this.config.trackingID;
    var domain = this.config.domain || "auto";
    if (trackingID){
      paella.log.debug("Google Analitycs Enabled");
      /* jshint ignore:start */
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','__gaTracker');
      /* jshint ignore:end */
      __gaTracker('create', trackingID, domain);
      __gaTracker('send', 'pageview');
      onSuccess(true);
    }		
    else {
      paella.log.debug("No Google Tracking ID found in config file. Disabling Google Analitycs PlugIn");
      onSuccess(false);
    }				
  }

  ...
```

Finally, use the `log()` function to register the user actions in the Google Analytics service.

```javascript
  ...

  log(event, params) {
    if ((this.config.category === undefined) || (this.config.category ===true)) {
      var category = this.config.category || "PaellaPlayer";
      var action = event;
      var label =  "";
      
      try {
        label = JSON.stringify(params);
      }
      catch(e) {}
      
      __gaTracker('send', 'event', category, action, label);
    }
  }

  ...
```
