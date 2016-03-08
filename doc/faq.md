#Paella Player FAQ

###**- Can I use Paella Player for free?**

Paella Player is licensed as GPLv3. So, yes, you can use Paella Player for free, but keep in mind that license restrictions still apply.

###**- What browsers are supported in Paella?**

Most HTML5 browsers should work with Paella. By default Paella tries to load the videos using the html5 video tag. If it fails it will use the .swf component to play that video, so Paella should work in any modern browser (through Flash).

We test Paella in Chrome, Safari, Internet Explorer and Firefox.

###**- How works the XXX plugin?**

It should be written on the [Paella Player Plugin Documentation](adopter_doc/plugins.md).

###**- I have a RTMP streaming server. Will Paella work?**

Paella ships with a .swf component to support RTMP streaming, so it should work. There is a known issue with RTMPS (secure RTMP) and Paella.

###**- I/my users have a metered data connection. What about data consumption?**

If you are using Paella with HTML5 it makes a local cache of the video upon loading, so maybe it is wise to advise the users before loading. Please note that the video downloads just by embedding on a web page. Anyway viewing 2 hours HD videos can kill your data connection

If your users can have those problems you should think on a streaming server.

###**- Will Paella work on my iPad/Android?**

Yes, but with some limitations. HTML5 multistream video playing is restricted on mobile devices. So, Paella player shows a images slideview instead a video for the slides video, and the original video for the presenter video. Take a llok at the [browser compatibility issues](adopter_doc/browser_compability.md) documentation.

###**- When embedding some tools disappear**

This is not a bug, is a feature ;-). Try to embed on a larger space or tune up what icons should disappear. Please refer to the [adopters's guides](adopter_doc/README.md).

###**- I Serve my recordings through RTMP and progressive download. Can I choose the preference order?**

Yes. By default Paella tries to do it by RTMP, then by HTML5 <video> tag and as the last option through flash. You can change the order of these options in the config file, as described in the [Paella Player configuration guide](config.md).

###**- Do Paella player support Live Streaming?**

Yes, Since Paella 3.1 we support RTMP Live Streaming. Go to the [adopters's guides](adopter_doc/README.md) form more information.

###**- Can I integrate Paella Player in my website?**

Yes, and if you need info about how, read the [adopters's guides](adopter_doc/README.md)

###**- Can I change the visual aspect of Paella Player?**

Yes, you can change all visual details since css, images, icons.. etc. 
Read more about how to do it in [skining documentation.](adopter_doc/skining.md)

###**- Can I change default configuration of Paella?**

Yes, all about configuration is explained in the [adopters's guides](adopter_doc/README.md)

