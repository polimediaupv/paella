# Time line button plugin example
## es.upv.paella.frameControlPlugin

A time line button plugin is an special type of [pop up button plugin](popup_plugin.md) that
presents a pop up that have the same width the playback bar. You can use this kind of plugin
to present contents that are related with the time line. In this example you can see some code
extracted from the frame control plugin. This plugin shows the presentation slides above.

See the [button pugin](button_plugin.md) and the [pop up button plugin](popup_plugin.md) for more
info.

### Creation
To create a time line button plugin, you can do it in the same way as the button plugin or the
pop up button plugin, specifying paella.ButtonPlugin.type.timeLineButton as button type:

	Class ("paella.plugins.FrameControlPlugin",paella.ButtonPlugin,{
		...
		getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },
		
### Pop up content
To specify the pop up content you only need to overwrite the buildContent() function,
[as you do it with a regular pop up button plugin](pupup_plugin.md)

		buildContent:function(domElement) {
			
			...

			domElement.appendChild(this.navButtons.left);
			domElement.appendChild(container);
			container.appendChild(content);
			domElement.appendChild(this.navButtons.right);

			...
		},
