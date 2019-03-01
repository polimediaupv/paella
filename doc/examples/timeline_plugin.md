---
---

# Time line button plugin example

Check [button plugin creation](button_plugin.md) and [popup plugin creation](popup_plugin.md) documents before continue.

## es.upv.paella.frameControlPlugin

A time line button plugin is an special type of [pop up button plugin](popup_plugin.md) that
presents a pop up that have the same width the playback bar. You can use this kind of plugin
to present contents that are related with the time line. In this example you can see some code
extracted from the frame control plugin. This plugin shows the presentation slides above.

### Creation

To create a time line button plugin, you can do it in the same way as the button plugin or the
pop up button plugin, specifying paella.ButtonPlugin.type.timeLineButton as button type:

```javascript
paella.addPlugin(function() {
  return class FrameControlPlugin extends paella.ButtonPlugin {
    ...
    getButtonType() { return paella.ButtonPlugin.type.timeLineButton; }

```

### Pop up content

To specify the pop up content you only need to overwrite the buildContent() function,
[as you do it with a regular pop up button plugin](popup_plugin.md)

```javascript
buildContent:function(domElement) {
  var container = document.createElement('div');
  container.className = 'frameControlContainer';

  this.contx = container;

  var content = document.createElement('div');
  content.className = 'frameControlContent';

  this.navButtons = {
    left:document.createElement('div'),
	right:document.createElement('div')
  };
  this.navButtons.left.className = 'frameControl navButton left';
  this.navButtons.right.className = 'frameControl navButton right';

  var frame = this.getFrame(null);

  domElement.appendChild(this.navButtons.left);
  domElement.appendChild(container);
  container.appendChild(content);
  domElement.appendChild(this.navButtons.right);
  ...
},
```
