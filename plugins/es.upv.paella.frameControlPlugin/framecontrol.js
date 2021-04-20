paella.addPlugin(function() {
	return class FrameCaptionsSearchPlugIn extends paella.SearchServicePlugIn {
		getName() { return "es.upv.paella.frameCaptionsSearchPlugin"; }

		search(text, next) {
			let re = RegExp(text,"i");
			let results = [];
			for (var key in paella.player.videoLoader.frameList) {
				var value = paella.player.videoLoader.frameList[key];
				if (typeof(value)=="object") {
					if (re.test(value.caption)) {
						results.push({
							time: key,
							content: value.caption,
							score: 0
						});					
					}
				}
			}
			if (next) {
				next(false, results);
			}
		}	
	}
});

paella.addPlugin(function() {
	return class FrameControlPlugin extends paella.ButtonPlugin {
		get frames() { return this._frames; }
		set frames(v) { this._frames = v; }
		get highResFrames() { return this._highResFrames; }
		set highResFrames(v) { this._highResFrames = v; }
		get currentFrame() { return this._currentFrame; }
		set currentFrame(v) { this._currentFrame = v; }
		get navButtons() { return this._navButtons; }
		set navButtons(v) { this._navButtons = v; }
		get buttons() {
			if (!this._buttons) {
				this._buttons = [];
			}
			return this._buttons;
		}
		set buttons(v) { this._buttons = v; }
		get contx() { return this._contx; }
		set contx(v) { this._contx = v; }
		
		getAlignment() { return 'right'; }
		getSubclass() { return "frameControl"; }
		getIconClass() { return 'icon-photo'; }
		getIndex() { return 510; }
		getName() { return "es.upv.paella.frameControlPlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.timeLineButton; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Navigate by slides"); }

		checkEnabled(onSuccess) {
			this._img = null;
			this._searchTimer = null;
			this._searchTimerTime = 250;

			if (paella.initDelegate.initParams.videoLoader.frameList==null) onSuccess(false);
			else if (paella.initDelegate.initParams.videoLoader.frameList.length===0) onSuccess(false);
			else if (Object.keys(paella.initDelegate.initParams.videoLoader.frameList).length==0) onSuccess(false);
			else onSuccess(true);
		}

		setup() {
			this._showFullPreview = this.config.showFullPreview || "auto";
			
			var thisClass = this;
			var oldClassName;
			var blockCounter = 1;
			var correctJump = 0;
			var selectedItem = -1;
			var jumpAtItem;
			var Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

			$(this.button).keyup(function(event) {
				var visibleItems = Math.floor(thisClass.contx.offsetWidth/100);
				var rest = thisClass.buttons.length%visibleItems;
				var blocks = Math.floor(thisClass.buttons.length/visibleItems);

				if (thisClass.isPopUpOpen()){
					if (event.keyCode == Keys.Left) {
					if(selectedItem > 0){
							thisClass.buttons[selectedItem].className = oldClassName;

							selectedItem--;

							if(blockCounter > blocks) correctJump = visibleItems - rest;
							jumpAtItem = ((visibleItems)*(blockCounter-1))-1-correctJump;

							if(selectedItem == jumpAtItem && selectedItem != 0){
								thisClass.navButtons.left.scrollContainer.scrollLeft -= visibleItems*105;
								--blockCounter;
							}

							if(this.hiResFrame) thisClass.removeHiResFrame();
							if (!paella.utils.userAgent.browser.IsMobileVersion) {
								thisClass.buttons[selectedItem].frameControl.onMouseOver(null,thisClass.buttons[selectedItem].frameData);
							}
							
							oldClassName = thisClass.buttons[selectedItem].className;
							thisClass.buttons[selectedItem].className = 'frameControlItem selected';
						}
					}
					else if (event.keyCode == Keys.Right) {
						if(selectedItem<thisClass.buttons.length-1){
							if(selectedItem >= 0){
								thisClass.buttons[selectedItem].className = oldClassName;
							}

							selectedItem++;

							if (blockCounter == 1) correctJump = 0;
							jumpAtItem = (visibleItems)*blockCounter-correctJump;

							if(selectedItem == jumpAtItem){
								thisClass.navButtons.left.scrollContainer.scrollLeft += visibleItems*105;
								++blockCounter;
							}

							if(this.hiResFrame)thisClass.removeHiResFrame();
							if (!paella.utils.userAgent.browser.IsMobileVersion) {
								thisClass.buttons[selectedItem].frameControl.onMouseOver(null,thisClass.buttons[selectedItem].frameData);
							}
							
							oldClassName = thisClass.buttons[selectedItem].className;
							thisClass.buttons[selectedItem].className = 'frameControlItem selected';
						}
					}
					else if (event.keyCode == Keys.Return) {
						thisClass.buttons[selectedItem].frameControl.onClick(null,thisClass.buttons[selectedItem].frameData);
						oldClassName = 'frameControlItem current';
					}
					else if (event.keyCode == Keys.Esc){
						thisClass.removeHiResFrame();
					}
				}
			});
		}

		buildContent(domElement) {
			var thisClass = this;
			this.frames = [];
			var container = document.createElement('div');
			container.className = 'frameControlContainer';

			thisClass.contx = container;

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
			content.innerText = '';
			$(window).mousemove(function(event) {
				if ($(content).offset().top>event.pageY || !$(content).is(":visible") ||
					($(content).offset().top + $(content).height())<event.pageY)
				{
					thisClass.removeHiResFrame();
				}
			});

			var frames = paella.initDelegate.initParams.videoLoader.frameList;
			var numFrames;
			if (frames) {
				var framesKeys = Object.keys(frames);
				numFrames = framesKeys.length;

				framesKeys.map(function(i){return Number(i, 10);})
				.sort(function(a, b){return a-b;})
				.forEach(function(key){
					var frameItem = thisClass.getFrame(frames[key]);
					content.appendChild(frameItem,'frameContrlItem_' + numFrames);
					thisClass.frames.push(frameItem);
				});
			}

			$(content).css({width:(numFrames * itemWidth) + 'px'});

			paella.events.bind(paella.events.setTrim,(event,params) => {
				this.updateFrameVisibility(params.trimEnabled,params.trimStart,params.trimEnd);
			});
			paella.player.videoContainer.trimming()
				.then((trimData) => {
					this.updateFrameVisibility(trimData.enabled,trimData.start,trimData.end);
				});
			

			paella.events.bind(paella.events.timeupdate,(event,params) => this.onTimeUpdate(params.currentTime) );
		}

		showHiResFrame(url,caption) {
			var frameRoot = document.createElement("div");
			var frame = document.createElement("div");
			var hiResImage = document.createElement('img');
			this._img = hiResImage;
			hiResImage.className = 'frameHiRes';
			hiResImage.setAttribute('src',url);
			hiResImage.setAttribute('style', 'width: 100%;');

			$(frame).append(hiResImage);
			$(frameRoot).append(frame);

			frameRoot.setAttribute('style', 'display: table;');
			frame.setAttribute('style', 'display: table-cell; vertical-align:middle;');

		    if (this.config.showCaptions === true){
			var captionContainer = document.createElement('p');
			captionContainer.className = "frameCaption";
			captionContainer.innerText = caption || "";
			frameRoot.append(captionContainer);
			this._caption = captionContainer;
		    }

			let overlayContainer = paella.player.videoContainer.overlayContainer;
			
			switch(this._showFullPreview) {
				case "auto":
					var streams = paella.initDelegate.initParams.videoLoader.streams;
					if (streams.length == 1){
						overlayContainer.addElement(frameRoot, overlayContainer.getVideoRect(0));
					}
					else if (streams.length >= 2){
						overlayContainer.addElement(frameRoot, overlayContainer.getVideoRect(1));
					}
					overlayContainer.enableBackgroundMode();
					this.hiResFrame = frameRoot;
					break;
				case "master":
					overlayContainer.addElement(frameRoot, overlayContainer.getVideoRect(0));
					overlayContainer.enableBackgroundMode();
					this.hiResFrame = frameRoot;
					break;
				case "slave":
					var streams = paella.initDelegate.initParams.videoLoader.streams;
					if (streams.length >= 2){
						overlayContainer.addElement(frameRoot, overlayContainer.getVideoRect(0));
						overlayContainer.enableBackgroundMode();
						this.hiResFrame = frameRoot;
					}
					break;
			}
		}

		removeHiResFrame() {
			var thisClass = this;
			var overlayContainer = paella.player.videoContainer.overlayContainer;
			if (this.hiResFrame) {
				overlayContainer.removeElement(this.hiResFrame);
			}
			overlayContainer.disableBackgroundMode();
			thisClass._img = null;
		}

		updateFrameVisibility(trimEnabled,trimStart,trimEnd) {
			var i;
			if (!trimEnabled) {
				for (i = 0; i<this.frames.length;++i) {
					$(this.frames[i]).show();
				}
			}
			else {
				for (i = 0; i<this.frames.length; ++i) {
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
		}

		getFrame(frameData,id) {
			var frame = document.createElement('div');
			frame.className = 'frameControlItem';
			if (id) frame.id = id;
			if (frameData) {

				this.buttons.push(frame);

				frame.frameData = frameData;
				frame.frameControl = this;
				var image = frameData.thumb ? frameData.thumb:frameData.url;
				var labelTime = paella.utils.timeParse.secondsToTime(frameData.time);
				frame.innerHTML = '<img src="' + image + '" alt="" class="frameControlImage" title="'+labelTime+'" aria-label="'+labelTime+'"></img>';
				if (!paella.utils.userAgent.browser.IsMobileVersion) {
					$(frame).mouseover(function(event) {
						this.frameControl.onMouseOver(event,this.frameData);
					});
				}
				
				$(frame).mouseout(function(event) {
					this.frameControl.onMouseOut(event,this.frameData);
				});
				$(frame).click(function(event) {
					this.frameControl.onClick(event,this.frameData);
				});
			}
			return frame;
		}

		onMouseOver(event,frameData) {
			var frames = paella.initDelegate.initParams.videoLoader.frameList;
			var frame = frames[frameData.time];
			if (frame) {
				var image = frame.url;
				if(this._img){
				    this._img.setAttribute('src',image);
				    if (this.config.showCaptions === true){
					this._caption.innerText = frame.caption || "";
				    }
				}
				else{
					this.showHiResFrame(image,frame.caption);
				}
			}
			
			if(this._searchTimer != null){
				clearTimeout(this._searchTimer);
			}
		}

		onMouseOut(event,frameData) {
			this._searchTimer = setTimeout((timer) => this.removeHiResFrame(), this._searchTimerTime);
		}

		onClick(event,frameData) {
			paella.player.videoContainer.trimming()
				.then((trimming) => {
					let time = trimming.enabled ? frameData.time - trimming.start : frameData.time;
					if (time>0) {
						paella.player.videoContainer.seekToTime(time + 1);
					}
					else {
						paella.player.videoContainer.seekToTime(0);
					}
				});
		}

		onTimeUpdate(currentTime) {
			var frame = null;
			paella.player.videoContainer.trimming()
				.then((trimming) => {
				    let time = trimming.enabled ? currentTime + trimming.start : currentTime;

			for (var i = 0; i<this.frames.length; ++i) {
				if (this.frames[i].frameData && this.frames[i].frameData.time<=time) {
				    frame = this.frames[i];
				}
				else {
					break;
				}
			}
			if (this.currentFrame!=frame && frame) {
				//this.navButtons.left.scrollContainer.scrollLeft += 100;

				if (this.currentFrame) this.currentFrame.className = 'frameControlItem';
				this.currentFrame = frame;
				this.currentFrame.className = 'frameControlItem current';
			}


				});

		}
	}
});