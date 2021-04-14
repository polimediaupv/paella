---
---

# Paella Player FAQ

## Can I use Paella Player for free?

Paella Player is licensed under the terms of the Educational Community License, Version 2.0 (ECL-2.0). So, yes, you can use Paella Player for free, but keep in mind that license restrictions still apply.

## What browsers are supported in Paella?

Most HTML5 browsers should work with Paella.

We test Paella in Chrome, Safari, Firefox, Edge (Chromium) and Opera.

## How works the XXX plugin?

It should be written on the [Paella Player Plugin Documentation](adopters/plugins.md).

## I have a RTMP streaming server. Will Paella work?

[Flash support officially ended on December 31, 2020](https://www.adobe.com/es/products/flashplayer/end-of-life.html) and is now blocked by default in all browsers. The RTMP format works on the web through Flash Player, and therefore there is no longer support for RTMP in Paella Player. Streaming support is currently implemented using [HLS](https://developer.apple.com/streaming).



## I/my users have a metered data connection. What about data consumption?

If you are using Paella with HTML5 it makes a local cache of the video upon loading, so maybe it is wise to advise the users before loading. Please note that the video downloads just by embedding on a web page. Anyway viewing 2 hours HD videos can kill your data connection

If your users can have those problems you should think on a streaming server.

## Will Paella work on my iPad/Android?

Yes, but with some limitations. HTML5 multistream video playing is restricted on mobile devices. So, Paella player shows a images slideview instead a video for the slides video, and the original video for the presenter video. Take a llok at the [browser compatibility issues](adopters/browser_compability.md) documentation.

## When embedding some tools disappear

This is not a bug, is a feature ;-). Try to embed on a larger space or tune up what icons should disappear.

## I serve my recordings through HLS and progressive download. Can I choose the preference order?

You can change the order of these options in the config file, as described in the [Paella Player configuration guide](adopters/configure.md).

## Do Paella player support Live Streaming?

Yes, we support HLS Live Streaming.

## Can I integrate Paella Player in my website?

Yes, and if you need info about how, read the [How to install and configure paella player](adopters/setup.md) page.

## Can I change the visual aspect of Paella Player?

Yes, you can change all visual details since css, images, icons.. etc.
Read more about how to do it in [skining documentation.](adopters/skining.md)

## Can I change default configuration of Paella?

Yes, all about configuration is explained in the [configuration guide](adopters/configure.md)
