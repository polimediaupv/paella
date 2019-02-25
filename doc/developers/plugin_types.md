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
  
  Regarding the action done when the user click on the button, a button plugin can implement three subtypes:
    - Push button: [playPauseButtonPlugin](../examples/button_plugin.md)
    - Pop up button: [multipleQualitiesPlugin](../examples/popup_plugin.md)
    - Time line button: [helpPlugin](../adopters/plugins/es.upv.paella.helpPlugin.md)
  
- Video Overlay Button Plugin

  This type of plugin is similar to a button plugin, but it is located above the video container.
  
  Plugin example: [liveStramingIndicatorPlugin](../adopters/plugins/es.upv.paella.liveStramingIndicatorPlugin.md) 


## Interact with the player

- Event Driven Plugins

  The event driven plugins was made for listening events from Paella and triggering actions to catch these events.

  Plugin example: [breaksPlayerPlugin](../adopters/plugins/es.upv.paella.breaksPlayerPlugin.md)

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
  
  Plugin examples: [googleAnalyticsSaverPlugin](../adopters/plugins/es.upv.paella.usertracking.googleAnalyticsSaverPlugin.md),
  [elasticsearchSaverPlugin](../adopters/plugins/es.upv.paella.usertracking.elasticsearchSaverPlugin.md)

## Video plugins

This type of plugin allows you to extend the capabilities of playing new video formats.

Plugin Examples: [hlsPlugin](plugins/es.upv.paella.hlsPlayer.md)

## Video layouts

