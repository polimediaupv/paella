paella.plugins.FrameControlPlugin = Class.create(paella.ButtonPlugin,{
	frames:null,
	highResFrames:null,
	currentFrame:null,
	navButtons:null,
	buttons: [],
	selected_button: -1,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "frameControl"; },
	getIndex:function() { return 510; },
	getMinWindowSize:function() { return 200; },
	getName:function() { return "es.upv.paella.FrameControlPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Navigate by slides"); },	
	checkEnabled:function(onSuccess) {
		onSuccess(paella.initDelegate.initParams.videoLoader.frameList!=null);
	},

	setup:function() {
		var thisClass = this;
		var oldClassName;
    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	if (thisClass.isPopUpOpen()){
		    	if (event.keyCode == Keys.Left) {
		           if(thisClass.selected_button>0){
			            if(thisClass.selected_button<thisClass.buttons.length){
			            	thisClass.buttons[thisClass.selected_button].frameControl.onMouseOut(null,thisClass.buttons[thisClass.selected_button].frameData);
				            thisClass.buttons[thisClass.selected_button].className = oldClassName;
			            	thisClass.navButtons.left.scrollContainer.scrollLeft -= 90;
			            }
					    thisClass.selected_button--;

					    thisClass.buttons[thisClass.selected_button].frameControl.onMouseOver(null,thisClass.buttons[thisClass.selected_button].frameData);
					    oldClassName = thisClass.buttons[thisClass.selected_button].className;
					    thisClass.buttons[thisClass.selected_button].className = 'frameControlItem selected'; 
		           	}
	            }
	            else if (event.keyCode == Keys.Right) {
	            	if(thisClass.selected_button<thisClass.buttons.length-1){
	            		if(thisClass.selected_button>=0){
	            			thisClass.buttons[thisClass.selected_button].frameControl.onMouseOut(null,thisClass.buttons[thisClass.selected_button].frameData);
	            			thisClass.buttons[thisClass.selected_button].className = oldClassName;
	            			thisClass.navButtons.left.scrollContainer.scrollLeft += 90;
	            		}
	            		thisClass.selected_button++;
	            		
	            		thisClass.buttons[thisClass.selected_button].frameControl.onMouseOver(null,thisClass.buttons[thisClass.selected_button].frameData);
	               		oldClassName = thisClass.buttons[thisClass.selected_button].className;
	               		thisClass.buttons[thisClass.selected_button].className = 'frameControlItem selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	            	thisClass.buttons[thisClass.selected_button].frameControl.onClick(null,thisClass.buttons[thisClass.selected_button].frameData);
	            	oldClassName = 'frameControlItem current';
	            }
            }	
        });
    },

	buildContent:function(domElement) {
		this.frames = [];
		var container = document.createElement('div');
		container.className = 'frameControlContainer';
		
		var content = document.createElement('div');
		content.className = 'frameControlContent';
		
		this.navButtons = {
			left:document.createElement('div'),
			right:document.createElement('div')
		}
		this.navButtons.left.className = 'frameControl navButton left';
		this.navButtons.right.className = 'frameControl navButton right';
		
		var frame = this.getFrame(null);
		
		domElement.appendChild(this.navButtons.left);
		domElement.appendChild(container);
		container.appendChild(content);
		domElement.appendChild(this.navButtons.right);
		
		this.navButtons.left.scrollContainer = container;
		$(this.navButtons.left).click(function(event) {
			this.scrollContainer.scrollLeft -= 100;
		});

		this.navButtons.right.scrollContainer = container;
		$(this.navButtons.right).click(function(event) {
			this.scrollContainer.scrollLeft += 100;
		});
		
		content.appendChild(frame);
		
		var itemWidth = $(frame).outerWidth(true);
		content.innerHTML = '';
		
		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		if (frames) {
			var numFrames = 0;
			for (var key in frames) {
				var frameItem = this.getFrame(frames[key]);
				content.appendChild(frameItem,'frameContrlItem_' + numFrames);
				this.frames.push(frameItem);
				++numFrames;
			}
		}
		
		$(content).css({width:(numFrames * itemWidth) + 'px'});
		
		var This = this;
		paella.events.bind(paella.events.setTrim,function(event,params) {
			This.checkVisibility(params.trimEnabled,params.trimStart,params.trimEnd);
		});
		
		paella.events.bind(paella.events.timeupdate,function(event,params) { This.onTimeUpdate(params.currentTime) });
	},
	
	showHiResFrame:function(url) {
		var frameRoot = document.createElement("div"); 
		var frame = document.createElement("div"); 
		var hiResImage = document.createElement('img'); 
        hiResImage.className = 'frameHiRes';
        hiResImage.setAttribute('src',url);
        hiResImage.setAttribute('style', 'width: 100%;');

		$(frame).append(hiResImage);
		$(frameRoot).append(frame);

        frameRoot.setAttribute('style', 'display: table;');
        frame.setAttribute('style', 'display: table-cell; vertical-align:middle;');
		overlayContainer = paella.player.videoContainer.overlayContainer;
		
		var streams = paella.initDelegate.initParams.videoLoader.streams;
		if (streams.length == 1){
			overlayContainer.addElement(frameRoot, overlayContainer.getMasterRect());
		}
		else if (streams.length >= 2){
			overlayContainer.addElement(frameRoot, overlayContainer.getSlaveRect());
		}
		overlayContainer.enableBackgroundMode();
		this.hiResFrame = frameRoot;
	},

	removeHiResFrame:function() {
		overlayContainer = paella.player.videoContainer.overlayContainer;
		overlayContainer.removeElement(this.hiResFrame);
		overlayContainer.disableBackgroundMode();
	},
	
	checkVisibility:function(trimEnabled,trimStart,trimEnd) {
		if (!trimEnabled) {
			for (var i = 0; i<this.frames.length;++i) {
				$(this.frames[i]).show();
			}
		}
		else {
			for (var i = 0; i<this.frames.length; ++i) {
				var frameElem = this.frames[i];
				var frameData = frameElem.frameData;
				if (frameData.time<trimStart) {
					if (this.frames.length>i+1 && this.frames[i+1].frameData.time>trimStart) {
						$(frameElem).show();
					}
					else {
						$(frameElem).hide();
					}
				}
				else if (frameData.time>trimEnd) {
					$(frameElem).hide();
				}
				else {
					$(frameElem).show();
				}
			}	
		}
	},
	
	getFrame:function(frameData,id) {
		var frame = document.createElement('div');
		frame.className = 'frameControlItem';
		if (id) frame.id = id;
		if (frameData) {

			this.buttons.push(frame);

			frame.frameData = frameData;
			frame.frameControl = this;
			image = frameData.thumb ? frameData.thumb:frameData.url;
			var labelTime = paella.utils.timeParse.secondsToTime(frameData.time);
			frame.innerHTML = '<img src="' + image + '" alt="" class="frameControlImage" title="'+labelTime+'" aria-label="'+labelTime+'"></img>';
			$(frame).mouseover(function(event) {
				this.frameControl.onMouseOver(event,this.frameData);
			});
			$(frame).mouseout(function(event) {
				this.frameControl.onMouseOut(event,this.frameData);
			});
			$(frame).click(function(event) {
				this.frameControl.onClick(event,this.frameData);
			});
		}
		return frame;
	},
	
	onMouseOver:function(event,frameData) {
		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		var frame = frames[frameData.time];
		if (frame) {
			var image = frame.url;
			this.showHiResFrame(image);
		}
	},
	
	onMouseOut:function(event,frameData) {
		this.removeHiResFrame();
	},
	
	onClick:function(event,frameData) {
		paella.events.trigger(paella.events.seekToTime,{time:frameData.time + 1});
	},
	
	onTimeUpdate:function(currentTime) {
		var frame = null;
		for (var i = 0; i<this.frames.length; ++i) {
			if (this.frames[i].frameData.time<=currentTime) {
				frame = this.frames[i];
			}
			else {
				break;
			}
		}
		if (this.currentFrame!=frame) {

			//this.navButtons.left.scrollContainer.scrollLeft += 100;

			if (this.currentFrame) this.currentFrame.className = 'frameControlItem';
			this.currentFrame = frame;
			this.currentFrame.className = 'frameControlItem current';
		}
	}
});

paella.plugins.frameControlPlugin = new paella.plugins.FrameControlPlugin();
