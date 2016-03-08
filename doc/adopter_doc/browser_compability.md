# Browser compatibility issues

- Mobile devices and iOS do not support automatic playback on page load.
- Volume and mute state cannot be controlled on mobile platforms and iOS.
- Mobile phones and iPod do not allow inline playback in the browser. The native player component takes over entirely. They therefore also do not fully support the JavaScript API, especially when it comes to interaction with the page.
- Native fullscreen is supported in Chrome 15+, Safari 5.1+ and Firefox 14+. Old browsers will use the full browser window.
- ...

## References

- [iPad issues](http://blog.millermedeiros.com/unsolved-html5-video-issues-on-ios/)
- [Notes on HTML5 video and iPhone](https://jonathanstark.com/blog/notes-on-html5-video-and-iphone?filename=2010/02/15/notes-on-html5-video-and-iphone/)
