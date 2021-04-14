---
---

# Plugin System

Paella player can be extended using plugins. There are diferent types of plugins depending
what functionality you want to add.

## Interact with the user

There are two main plugins types to interact with the user giving him control over
the plugin and its funcionalities.

- Button Plugin
  
  A button plugin allow you to add a button to the paella bar.
  
  Regarding the action done when the user click on the button, a button plugin can implement four subtypes:

    * Push button: Example [playPauseButtonPlugin](../examples/button_plugin.md)
    * Pop up button: Example [popup plugin](../examples/popup_plugin.md)
    * Timeline button: Example [timeline plugin](../examples/timeline_plugin.md)
    * Menu button: Example [multiple quality plugin](../examples/multi_quality_plugin.md)
  
- Video Overlay Button Plugin

  This type of plugin is similar to a button plugin, but it is located above the video container.
  
  Plugin example: [Video overlay plugin](../examples/video_overlay.md) 

- Playback bar canvas plugin: The playback bar, which shows the progress of the video, includes a canvas with two layers where you can display information. Layer 0 is drawn below the elapsed time marker, and layer 1 is drawn above it.

  Plugin example: [Buffered playback bar canvas plugin](../examples/buffered_playback_canvas.md)

- Key plugin: Allows you to control keyboard events to execute actions. This is the preferred method if you want to modify the operation of hotkeys. It is possible to activate more than one keyboard plugin simultaneously, but there may be incompatibility problems between them, so we recommend activating only one keyboard plugin.

  Plugin example: [Default keys plugin](../examples/key_plugin.md)

## Interact with the player

- Event Driven Plugins

  The event driven plugins was made for listening events from Paella and triggering actions to catch these events.

  Plugin example: [play button on video area](../examples/es.upv.paella.playButtonOnScreenPlugin.md)

- Captions Parser Plugin

  This plugin type is used to add new captions parser to the player. For dafault paella comes with a dfxp caption
  parser. You can create a new captions parser by creating a new caption parser plugin.
  
- Search Service Plugins

  Paella comes with a search service that can be extended with plugins. By default Paella comes with a search
  service plugin that allow the user to search in the captions. But any institution can add a new search provider.
  
- User Tracking Saver Plugin

  Paella comes with a user tracking service. This is useful for capturing user events and learning how visitros
  uses the player. By default paella does nothing with those user events, but any institution can write a user
  tracking saver plugin to save those events.
  
  Paella comes with 2 user tracking saver plugins that institutions can enable to save the events to
  Google Analitycs or an ElasticSearch server.
  
  Plugin examples: [googleAnalyticsSaverPlugin](../examples/es.upv.paella.usertracking.googleAnalyticsSaverPlugin.md)


## Video plugins

This type of plugin allows you to extend the capabilities of playing new video formats.

Plugin Examples: [hlsPlugin](../examples/es.upv.paella.hlsPlayer.md)

## Defining the layout of videos: video profiles

Since Paella Player is a multi stream player, there is a mechanism for specifying the layout of the videos to be played. This mechanism are the video profiles. It is an extensible mechanism that can be integrated into the Paella Player plugin system.

### Video profiles

Paella Player provides a series of predefined profiles that specify the layout of the videos, compatible with up to three streams. You can see how to configure the predefined video profiles [here](../adopters/integrate_datajson.md).

The video profiles are not strictly a plugin type, because they are not defined by extending any particular class type. A video profile is defined by an object that specifies all its properties. Nonetheless, you can use a basic Paella Player plugin to add new profiles using the function `paella.addProfile()`:

```javascript
paella.addProfile(() => {
  return new Promise((resolve,reject) => {
    resolve({
        // Your new profile video layout
    })
  })
});
```

### Integrate video profiles within the plugin life cycle

You can use this function at any time of the player life cycle, even during the video playback: when you add a profile using `paella.addProfile()`, the event `paella.events.profileListChanged` is triggered, and the profile selector button will be reloaded to show the new profile. But you can also use a basic plugin type, such as `paella.EventDrivenPlugin` to add new profiles within the player's life cycle.

```javascript

paella.addPlugin(function() {
  return class MyVideoProfilePlugin extends paella.EventDrivenPlugin {
    ...

    checkEnabled(onSuccess) {
      // Check if this profile should or should not be available
      if (this.myCheckProfileAvailabilityCondition {
        onSuccess(true);
        paella.addProfile(() => {
          return new Promise((resolve,reject) => {
            resolve({
              // Your new profile video layout
            })
          })
        });
      }
      else {
        onSuccess(false);
      }
    }

    ...
```

### The video profile object

The video profile definition object contains the properties of the profile, the settings of the elements to be displayed and other elements relevant to the operation of the profile.

The `videos` property is an array that defines the video streams that the profile must show. The measurements are specified in pixels, and refer to the video container. All these measurements are defined assuming that the video container measures 1280x720 pixels, and will be scaled proportionally to the actual size of the video window.

```javascript
{
      id: 'video_layout_identifier',
      name: { en: "My layout test" },
      hidden:false,
      icon: 'icon_url.svg',
      videos: [ // An array with a setup for each video you want to show in the layout
        {
          content:'presenter',  // this must match with the video manifest 'content' attribute
          rect:[
            // You can set one rectangle for each aspect ratio.
            // If none match, the most similar will be used
            { aspectRatio:"4/3",left:160,top:0,width:960,height:720 },
            { aspectRatio:"16/9",left:0,top:0,width:1280,height:720 }
          ],
          visible:true, // You can show or hide a video using this property
          layer:1   // It works as the z-index CSS property
        },
        {
          content:'presentation',  // this must match with the video manifest 'content' attribute
          ... // Another video layout
        }
      ],
      // Video area background
      background:{
        content: "slide_professor_paella.jpg",
        zIndex: 5,
        rect: { left:0, top:0, width:1280, height:720},
        visible:true,
        layer:0
      },
      // Logos
      logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}],
      // Buttons: you can add buttons to add interactivity, for example, to switch 
      buttons: [
        {
          rect: { left: 682, top: 565, width: 45, height: 45 },
          onClick: function(event) { this.switch(); }, 
          label:"Switch",
          icon:"icon_rotate.svg",
          layer: 2  // Layer 2 to show the button over the other contents
        },
        // Other buttons
      ],
      onApply: function() {
        // This function is invoqued when this profile is activated
      },
      onDeactivate: function() {
        // This function is invoqued when the profile is deactivated
      },

      // User defined function: switch() is invoqued in the onClick() function, in the button
      // defined above
      switch: function() {
        // Here you can modify this profile settings.
        let v0 = this.videos[0].content;
        let v1 = this.videos[1].content;
        this.videos[0].content = v1;
        this.videos[1].content = v0;

        // Calling this function, the profile will be reloaded:
        paella.profiles.placeVideos();
      }
    }

```

### Advanced video profiles

The predefined video profiles integrates the video layout definition using `paella.addProfile()` function with the plugin life cycle, but they also checks the video manifest file to determine which profiles must be available. To do it, the plugin compare the `content`field in each stream at the video manifest, with the settings specified in the `config.json` file:

```json
Example video manifest:
{
  ...
  "streams": [
    {
      "sources": { ... },
      ...
      "content":"presenter"
    },
    {
      "sources": { ... },
      ...
      "content":"presenter-2"
    },
    {
      "sources": { ... },
      ...
      "content":"presenter-3"
    },
    {
      "sources": { ... },
      ...
      "content":"presentation"
    }
  ]

```

```json
Example configuration in config.json
"es.upv.paella.dualStreamProfilePlugin": { "enabled":true,
  "videoSets": [
    { "icon":"slide_professor_icon.svg", "id":"presenter_presentation", "content":["presenter","presentation"] },
    { "icon":"slide_professor_icon.svg", "id":"presenter2_presentation", "content":["presenter-2","presentation"] },
    { "icon":"slide_professor_icon.svg", "id":"presenter3_presentation", "content":["presenter-3","presentation"] }
  ]
},
```

You can see how this mechanism works in the file [plugins/en.upv.defaultProfiles/main.js](https://github.com/polimediaupv/paella/blob/develop/plugins/es.upv.defaultProfiles/main.js)
