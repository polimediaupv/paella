# Plugin System

Paella player can be extended using plugins. There are diferent types of plugins depending
what functionality you want to add.

## Interact with the user
There are 3 main plugins types to interact with the user giving him control over
the plugin and its funcionalities.

- Button Plugin
  
  A button plugin allow you to add a button to the paella bar.
  
  Plugin examples: [playPauseButtonPlugin](../plugins/es.upv.paella.playPauseButtonPlugin.md),
  [multipleQualitiesPlugin](../plugins/es.upv.paella.multipleQualitiesPlugin.md),
  [helpPlugin](../plugins/es.upv.paella.helpPlugin.md)
  
  
  
  
- Video Overlay Button Plugin

  This plugin type is like a button plugin, but it is located at the top-right part over the paella player.
  
  Plugin example: [liveStramingIndicatorPlugin](../plugins/es.upv.paella.liveStramingIndicatorPlugin.md)

- TabBar Plugin

  The tabbar plugin is an old plugin type. This plugin was use in the extint paella-extended version.
  From Paella 4.1 paella-extended is extinted, but we build a new button plugin that allow old TabBar
  plugins to countinue working.
  
##  Interact with the player

- Event Driven Plugins

  The event driven plugins was made for listening events from Paella and triggering actions to catch these events.

  Plugin example: [breaksPlayerPlugin](../plugins/es.upv.paella.breaksPlayerPlugin.md)

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
  
  Plugin examples: [googleAnalyticsSaverPlugin](../plugins/es.upv.paella.usertracking.googleAnalyticsSaverPlugin.md),
  [elasticsearchSaverPlugin](../plugins/es.upv.paella.usertracking.elasticsearchSaverPlugin.md)

## Video plugins
A video plugin is the basic element that is able to manage (play, pause, stop, ...) a single video.
A video plugin shoud inherit from a `paella.VideoElementBase` class or any other class that inherit from it.

Plugin Examples: [es.upv.paella.rtmpPlayer](../../plugins/es.upv.paella.rtmpPlayer), [es.upv.paella.mpegDashPlayer](../../plugins/es.upv.paella.mpegDashPlayer)
