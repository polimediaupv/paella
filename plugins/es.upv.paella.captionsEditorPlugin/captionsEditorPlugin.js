/* Plugin override: PlayButtonOnScreen */
paella.addPlugin(function() {
	return class PlayButtonOnScreen extends paella.EventDrivenPlugin {
		constructor() {
			super();
			this.containerId = 'paella_plugin_PlayButtonOnScreen_captionsEditor';
			this.container = null;
			this.enabled = true;
			this.isPlaying = false;
			this.showIcon = true;
			this.firstPlay = false;
		}
	
		checkEnabled(onSuccess) {
			onSuccess(!paella.player.isLiveStream() || base.userAgent.system.Android 
				|| base.userAgent.system.iOS || !paella.player.videoContainer.supportAutoplay());
		}
	
		getIndex() { return 1010; }
		getName() { return "es.upv.paella.playButtonOnScreenPlugin_captionsEditor"; }
	
		setup() {
			var thisClass = this;
			this.container = document.createElement('div');
			this.container.className = "playButtonOnScreen";
			this.container.id = this.containerId;
			this.container.style.width = "100%";
			this.container.style.height = "100%";		
			paella.player.videoContainer.domElement.appendChild(this.container);
			$(this.container).click(function(event){thisClass.onPlayButtonClick();});
	
			var icon = document.createElement('canvas');
			icon.className = "playButtonOnScreenIcon";
			this.container.appendChild(icon);
	
			function repaintCanvas(){
				var width = jQuery(thisClass.container).innerWidth();
				var height = jQuery(thisClass.container).innerHeight();
	
				icon.width = width;
				icon.height = height;
	
				var iconSize = (width<height) ? width/3 : height/3;
	
				var ctx = icon.getContext('2d');
				// Play Icon size: 300x300
				ctx.translate((width-iconSize)/2, (height-iconSize)/2);
	
				ctx.beginPath();
				ctx.arc(iconSize/2, iconSize/2 ,iconSize/2, 0, 2*Math.PI, true);
				ctx.closePath();
	
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 10;
				ctx.stroke();
				ctx.fillStyle = '#8f8f8f';
				ctx.fill();
	
				ctx.beginPath();
				ctx.moveTo(iconSize/3, iconSize/4);
				ctx.lineTo(3*iconSize/4, iconSize/2);
				ctx.lineTo(iconSize/3, 3*iconSize/4);
				ctx.lineTo(iconSize/3, iconSize/4);
	
				ctx.closePath();
				ctx.fillStyle = 'white';
				ctx.fill();
	
				ctx.stroke();
			}
			paella.events.bind(paella.events.resize,repaintCanvas);
			repaintCanvas();
		}
	
		getEvents() {
			return [paella.events.endVideo,paella.events.play,paella.events.pause,paella.events.showEditor,paella.events.hideEditor,'paella:showCaptionsEditor','paella:hideCaptionsEditor'];
		}
	
		onEvent(eventType,params) {
			switch (eventType) {
				case paella.events.endVideo:
					this.endVideo();
					break;
				case paella.events.play:
					this.play();
					break;
				case paella.events.pause:
					this.pause();
					break;
				case paella.events.showEditor:
					this.showEditor();
					break;
				case paella.events.hideEditor:
					this.hideEditor();
					break;
				case 'paella:showCaptionsEditor':
					this.showCaptionsEditor();
					break;
				case 'paella:hideCaptionsEditor':
					this.hideCaptionsEditor();
					break;
			}
		}
	
		onPlayButtonClick() {
			this.firstPlay = true;
			this.checkStatus();
		}
	
		endVideo() {
			this.isPlaying = false;
			this.checkStatus();
		}
	
		play() {
			this.isPlaying = true;
			this.showIcon = false;
			this.checkStatus();
		}
	
		pause() {
			this.isPlaying = false;
			this.showIcon = true;
			this.checkStatus();
		}
	
		showEditor() {
			this.enabled = false;
			this.checkStatus();
		}
	
		hideEditor() {
			this.enabled = true;
			this.checkStatus();
		}

		showCaptionsEditor() {
			this.enabled = false;
			this.checkStatus();
		}
	
		hideCaptionsEditor() {
			this.enabled = true;
			this.checkStatus();
		}
		
		checkStatus() {
			if ((this.enabled && this.isPlaying) || !this.enabled || !this.showIcon) {
				$(this.container).hide();
			}
			else {
				$(this.container).show();
			}
		}
	}
});



/* captionsEditorPlugin */
paella.addPlugin(function() {
	return class CaptionsEditorPlugin extends paella.ButtonPlugin {
		getInstanceName() { return "captionsEditorPlugin"; }	// plugin instance will be available in paella.plugins.captionsEditorPlugin
		getAlignment() { return 'right'; }
		getSubclass() { return 'captionsEditorPluginButton'; }
		getIconClass() { return 'icon-edit'; }
		getName() { return "es.upv.paella.captionsEditorPlugin"; }
		getDefaultToolTip() { return base.dictionary.translate("Edit subtitles"); }
		getIndex() { return 509; }
	
		checkEnabled(onSuccess) {
			this._debugMode = true;
			this._pluginButton = null;
			this._profileId = "captionsEditorProfile";
			this._previousProfileId = null;
			this._open = 0;
			this._parent = null; // paella.player.videoContainer.domElement
			this._container = null;
			this._body = null;
			this._toolbar = null;
			this._activeCaptions = null;
			this._currentSegment = null;
			this._browserLang = null;
			this._autoScroll = true;
			this._isEditingSegment = false;
			this._editedIndexes = [];
			this._removedIndexes = [];
			this._settings = {
				editorWidth: '50vw'
			};

			onSuccess(true);
		}
	
		showUI() {
			if (self._open || (paella.captions.getAvailableLangs().length >= 1 && paella.captions.getActiveCaptions())) {
				super.showUI();
			}
			else {
				super.hideUI();
			}
		}

		addCaptionsEditorProfile() {
			var self = this;

			let content = [];
			paella.player.videoContainer.streamProvider.videoStreams.forEach((v) => {
				content.push(v.content);
			});

			let profileVideosObject = [{
				content: (content.length > 0 ? content[0] : "presenter"),
				rect:[
					{ aspectRatio:"16/9",left:0,top:0,width:640,height:360 },
				],
				buttons: [],
				visible:"true",
				layer:"1"
			}];

			for (let i=1; i<content.length; i++) {
				profileVideosObject.push({
					content:content[i],
					visible:"false",
					layer:"0"
				});
			}

			paella.addProfile(() => {
		    return new Promise((resolve,reject) => {
					resolve({
						id:self._profileId,
						name: {
							en: "Edit subtitles",
							es: "Editar subtítulos"
						},
						hidden:true,
						icon:"",
						videos: profileVideosObject,
						logos:[{content:"paella_logo.png",zIndex:5,rect:{top:10,left:10,width:49,height:42}}]
					})
		    });
		  });
		}
	
		setup() {
			var self = this;

			self.addCaptionsEditorProfile();
	
			// HIDE UI IF NO Captions
			if (!paella.captions.getAvailableLangs().length || !paella.captions.getActiveCaptions()) {
				paella.plugins.captionsEditorPlugin.hideUI();
			}
	
			//BINDS
			paella.events.bind(paella.events.captionsEnabled, function(event,params) {
				if (self._open)
				  self.onCaptionsUpdate(params);
			});
	
			paella.events.bind(paella.events.captionsDisabled, function(event,params) {
				if (self._open)
				  self.onCaptionsUpdate(params);
			});
	
			paella.events.bind(paella.events.captionAdded, function(event,params) {
				if (self._open) {
				  self.onCaptionAdded(params);
				  paella.plugins.captionsPlugin.showUI();
				}
			});
	
			paella.events.bind(paella.events.timeUpdate, function(event,params) {
				if (self._open)
				  self.onTimeUpdate(params);
			});

			paella.events.bind(paella.events.controlBarWillHide, function(evt) {
				if (self._open) 
					paella.player.controls.cancelHideBar();
			});

			paella.events.bind(paella.events.resize, function(evt) {
				if (self._open) 
					self.onResize();
			});
		}
	
		onTimeUpdate(time) {
			var self = this;

			if (time) {
				paella.player.videoContainer.trimming()
					.then((trimming) => {
						let offset = trimming.enabled ? trimming.start : 0;
						let caption = self._activeCaptions && self._activeCaptions.getClosestCaptionAtTime(time.currentTime + offset);

						if (caption && caption.id) {
							if (!self._currentSegment || caption.id != self._currentSegment.id) {
								self._currentSegment = caption;
								let currentSegmentElem = $(self._container).find('.captionsEditorSegmentContainer .captionsEditorSegment.current').removeClass('current');
								$(self._container).find('.captionsEditorSegmentContainer .captionsEditorSegment[data-id="'+self._currentSegment.id+'"]').addClass("current");
								
								if (self._autoScroll) {
									self.updateScrollFocus(currentSegmentElem);
								}
							}
						}
					});
			}
		}
	
		updateScrollFocus(elem) {
			var self = this;
			if (elem) {
				let pos = $(elem).offset();
				let parentScrollTop = $(".captionsEditorSegmentContainer").scrollTop();
				let h = $(self._body).height();
				if (pos && pos.top)
				  $(".captionsEditorSegmentContainer").stop().animate({'scrollTop': (parentScrollTop + pos.top - h/4)});
			}
		}
		
		onCaptionsUpdate(obj) {
			var self = this;
			self._debugMode && console.log("onCaptionsUpdate", obj);
	
			var _activeCaptions = paella.captions.getActiveCaptions();

			// Prevent losing changes
			self.checkDiscardChanges(_activeCaptions);

			// Close if no captions available
			if (!_activeCaptions) {
				self.action();
				self.showUI();
			}
			else {
				$('.CaptionsOnScreen').css('zIndex', 0);
				$('.CaptionsOnScreen').css('opacity', 0);
			}
		}

		replayCurrentSegment() {
			var self = this;
			if (self._currentSegment) {
				paella.player.videoContainer.seekToTime(self._currentSegment.begin);
				paella.player.playing().then(function(res) {
					if (!res) paella.player.play();
				});
			}
		}

		goToNextSegment() {
			var self = this;
			if (self._activeCaptions && self._currentSegment) {
				let currentIndex = self._activeCaptions._captions.findIndex(c => c.id == self._currentSegment.id);
				if (currentIndex && currentIndex >= 0 && currentIndex != self._activeCaptions._captions.length-1) {
					paella.player.videoContainer.seekToTime(self._activeCaptions._captions[currentIndex+1].begin);
					return true;
				}
			}
			return false;
		}

		goToPrevSegment() {
			var self = this;
			if (self._activeCaptions && self._currentSegment) {
				let currentIndex = self._activeCaptions._captions.findIndex(c => c.id == self._currentSegment.id);
				if (currentIndex && currentIndex > 0) {
					paella.player.videoContainer.seekToTime(self._activeCaptions._captions[currentIndex-1].begin);
					return true;
				}
			}
			return false;
		}
	
		action() {
			var self = this;
			self._browserLang = base.dictionary.currentLanguage();
			self._autoScroll = true;
	
			switch(self._open) {
				case 0:
					self._activeCaptions = paella.captions.getActiveCaptions();
					if (self._activeCaptions) {
						self._open = 1;

						$('.'+self.getSubclass()).addClass('selected');

						paella.keyManager.enabled = false;
						// paella.player.videoContainer.disablePlayOnClick();
						paella.player.editingCaptions = true;

						// Set profile
						self._previousProfileId = paella.profiles.getProfile() || paella.profiles.getDefaultProfile();
						paella.player.setProfile(self._profileId);

						// Build editor
						self.buildContent();

						// Hack: disable overlay captions
						// paella.events.trigger(paella.events.captionsDisabled);
						$('.CaptionsOnScreen').css('zIndex', 0);
						$('.CaptionsOnScreen').css('opacity', 0);
						
						if (paella.plugins.overlayCaptionsPlugin)
							paella.plugins.overlayCaptionsPlugin.hideContent();

						paella.events.trigger('paella:showCaptionsEditor');

						// Register global shortcuts
						$(document).on("keydown.paellaCaptionsEditor", function(e) {
							if (e.keyCode == 38) { // Up arrow
								if (!self._isEditingSegment) {
									self.goToPrevSegment();
									e.stopPropagation();
									e.preventDefault();
									return false;
								}
							}
							if (e.keyCode == 40) { // Down arrow
								if (!self._isEditingSegment) {
									self.goToNextSegment();
									e.stopPropagation();
									e.preventDefault();
									return false;
								}
							}
							if (e.keyCode == 13) { // Enter
								if (!self._isEditingSegment) {
									$(".captionsEditorSegment.current .captionsEditorSegmentText").trigger("focus");
									e.stopPropagation();
									e.preventDefault();
									return false;
								}
							}
							if (e.shiftKey && e.keyCode == 9) { // Shift+TAB
								self.replayCurrentSegment();
								e.stopPropagation();
								e.preventDefault();
								return false;
							}
							if (e.keyCode == 9) { // TAB
								paella.player.playing().then(function(res) {
									if (res) paella.player.pause();
									else paella.player.play();
								});
								e.stopPropagation();
								e.preventDefault();
								return false;
							}
						});
					}
					break;
			
				case 1: 
					self._open = 0;

					$('.'+self.getSubclass()).removeClass('selected');

					$(self._container).remove();
					paella.keyManager.enabled = true;
					paella.player.editingCaptions = false;
					if (self._previousProfileId) {
						paella.player.setProfile(self._previousProfileId);
						self._previousProfileId = null;
					}

					// Hack: renable overlay captions
					// paella.events.trigger(paella.events.captionsEnabled);
					$('.CaptionsOnScreen').css('zIndex', 99);
					$('.CaptionsOnScreen').css('opacity', 1);

					paella.events.trigger(paella.events.resize); // Not working
					window.dispatchEvent(new Event('resize'));

					//paella.player.videoContainer.enablePlayOnClick();

					paella.events.trigger('paella:hideCaptionsEditor');

					// Global shortcuts
					$(document).unbind(".paellaCaptionsEditor");

					break;
			}
		}
	
		buildContent() {
			var self = this;
			self._parent = paella.player.videoContainer.domElement;

			$(self._container).empty();
	
			self._container = document.createElement('div');
			self._container.className = 'captionsEditorPluginContainer';

			self._toolbar = document.createElement('div');
			self._toolbar.className = 'captionsEditorPluginToolbar';
			self._toolbar.onclick = function(e) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			};
			self._container.appendChild(self._toolbar);

			self._body = document.createElement('div');
			self._body.className = 'captionsEditorPluginBody';
			self._container.appendChild(self._body);
	
			self._parent.appendChild(self._container);
			if (self._activeCaptions)
				self.buildBodyContent();
			self.onResize();
		}

		buildBodyContent() {
			var self = this;

			$(self._body).empty().append('<div class="captionsEditorSegmentContainer"></div>');

			self._activeCaptions && self._activeCaptions._captions.forEach(function(segment, idx) {
				let segmentDiv = document.createElement('div');
				segmentDiv.className = 'captionsEditorSegment';
				segmentDiv.setAttribute('data-b', segment.begin.toFixed(2));
				segmentDiv.setAttribute('data-e', segment.end.toFixed(2));
				segmentDiv.setAttribute('data-id', segment.id);
				segmentDiv.setAttribute('data-index', idx);

				let segmentTimeContainer = document.createElement('div');
				segmentTimeContainer.className = 'captionsEditorSegmentTimeContainer';
				let segmentTimeBegin = document.createElement('div');
				segmentTimeBegin.className = 'captionsEditorSegmentTimeBegin';
				segmentTimeBegin.innerText = self._timeFormat(segment.begin, 1, '.', true);
				let segmentTimeEnd = document.createElement('div');
				segmentTimeEnd.className = 'captionsEditorSegmentTimeEnd';
				segmentTimeEnd.innerText = self._timeFormat(segment.end, 1, '.', true);
				segmentTimeContainer.appendChild(segmentTimeBegin);
				segmentTimeContainer.appendChild(segmentTimeEnd);
				segmentDiv.appendChild(segmentTimeContainer);

				let segmentText = document.createElement('div');
				segmentText.className = 'captionsEditorSegmentText';
				segmentText.innerText = segment.content;
				segmentText.contentEditable = "true";
				segmentDiv.appendChild(segmentText);

				$(self._body).children('.captionsEditorSegmentContainer').append(segmentDiv);

				/* Segment events */
				$(segmentDiv).on("click", function(e) {
					let segment = this;
					if (!self._currentSegment || $(segment).attr('data-id') != self._currentSegment.id) {
						let b = parseFloat($(segment).attr('data-b'));
						let e = parseFloat($(segment).attr('data-e'));
						paella.player.videoContainer.currentTime().then(function(time) {
							if (time < b || time > e)
						    paella.player.videoContainer.seekToTime(b + 0.05);
						});
					}
					e.stopPropagation();
					e.preventDefault();
					return false;
				});

				$(segmentText).on("click", function(e) {
					let segment = $(this).closest('.captionsEditorSegment');
					paella.player.pause();
					if (!self._currentSegment || $(segment).attr('data-id') != self._currentSegment.id) {
						let b = parseFloat($(segment).attr('data-b'));
						let e = parseFloat($(segment).attr('data-e'));
						paella.player.videoContainer.currentTime().then(function(time) {
							if (time < b || time > e)
						    paella.player.videoContainer.seekToTime(b + 0.05);
						});
					}
					self._isEditingSegment = true;
					e.stopPropagation();
					e.preventDefault();
					return false;
				});

				$(segmentText).on("blur focusout", function(e) {
					self._debugMode && console.log("Finished editing segment");
					self._isEditingSegment = false;
					let segment = $(this).closest('.captionsEditorSegment');
					if (self._activeCaptions.setCaptionByIndex($(segment).attr('data-index'), {
						content: $(segment).find('.captionsEditorSegmentText').text()
					})) {
						if (self._editedIndexes.indexOf($(segment).attr('data-index')) == -1)
							self._editedIndexes.push($(segment).attr('data-index'))
					}
					e.stopPropagation();
					e.preventDefault();
					return false;
				});

				$(segmentText).on("keyup DOMSubtreeModified", function(e) {
					let segment = $(this).closest('.captionsEditorSegment');
					if (self._activeCaptions.setCaptionByIndex($(segment).attr('data-index'), {
						content: $(segment).find('.captionsEditorSegmentText').text()
					})) {
						if (self._editedIndexes.indexOf($(segment).attr('data-index')) == -1)
							self._editedIndexes.push($(segment).attr('data-index'))
					}
					e.stopPropagation();
					e.preventDefault();
					return false;
				});

				$(segmentText).on("keydown", function(e) {
					if (e.keyCode == 13) { // Enter
						$(this).trigger("blur");
						e.stopPropagation();
						e.preventDefault();
						return false;
					}
				});

				$(segmentTimeBegin).on("click", function(e) {
					let segment = $(this).closest('.captionsEditorSegment');
					e.stopPropagation();
					e.preventDefault();
					return false;
				});

				$(segmentTimeEnd).on("click", function(e) {
					let segment = $(this).closest('.captionsEditorSegment');
					e.stopPropagation();
					e.preventDefault();
					return false;
				});
			});

			// Toolbar
			if (self._toolbar) {
				$(self._toolbar).empty();

				// Save button
				if (self.config.showSaveButton) {
					let saveButton = document.createElement('button');
					saveButton.className = 'captionsEditorToolbarButton';
					saveButton.innerText = base.dictionary.translate("Save");
					saveButton.onclick = function(e) {
						self.save();
						e.stopPropagation();
						e.preventDefault();
						return false;
					};
					self._toolbar.appendChild(saveButton);
				}

				// Export button
				let exportButton = document.createElement('button');
				exportButton.className = 'captionsEditorToolbarButton';
				exportButton.innerText = base.dictionary.translate("Export");
				exportButton.onclick = function(e) {
					self.exportDialog();
					e.stopPropagation();
					e.preventDefault();
					return false;
				};
				self._toolbar.appendChild(exportButton);

				// Import button
				let importButton = document.createElement('button');
				importButton.className = 'captionsEditorToolbarButton';
				importButton.innerText = base.dictionary.translate("Import");
				importButton.onclick = function(e) {
					self.importDialog();
					e.stopPropagation();
					e.preventDefault();
					return false;
				};
				// TODO
				// self._toolbar.appendChild(importButton);

				// Exit button
				let exitButton = document.createElement('button');
				exitButton.className = 'captionsEditorToolbarButton';
				exitButton.innerText = base.dictionary.translate("Close");
				exitButton.onclick = function(e) {
					self.action();
					e.stopPropagation();
					e.preventDefault();
					return false;
				};
				self._toolbar.appendChild(exitButton);

				// Help button
				let helpButton = document.createElement('button');
				helpButton.className = 'captionsEditorToolbarButton';
				helpButton.innerText = base.dictionary.translate("Help");
				helpButton.onclick = function(e) {
					self.showHelp();
					e.stopPropagation();
					e.preventDefault();
					return false;
				};
				self._toolbar.appendChild(helpButton);
			}

			self.onResize();
		}

		onResize() {
			var self = this;

			if (self._open) {
				$(self._container).width(this._settings.editorWidth);
				if ($('#playerContainer_controls_playback').length) {
					$(self._container).css('height', 'calc(100vh - ' + $('#playerContainer_controls_playback').outerHeight() + 'px)');
					$('.captionsEditorSegmentContainer').css('height', 'calc(100% - ' + $(self._toolbar).outerHeight() + 'px)');
				}
			}
		}

		_timeFormat(seconds, decimals = 0, decimalChar = '.', shorten = false) {
			if (typeof seconds !== 'undefined' && seconds != null && !isNaN(seconds)) {
				var date = new Date(null);
				date.setSeconds(seconds);
				var decimalStr = "";
				if (decimals > 0) decimalStr = decimalChar+(seconds % 1).toFixed(decimals).substring(2);
				let timeStr = date.toISOString().substr(11, 8)+decimalStr;
				if (shorten && timeStr.substr(0, 3) == '00:') return timeStr.substr(3);
				return timeStr;
			}
			else {
				return (shorten ? "--:--" : "--:--:--");
			}
		}

		_activeCaptionsToSaveObject() {
			return this._activeCaptions;
		}

		save(nextActiveCaptions) {
			var self = this;

			// Pause if playing
			paella.player.playing().then(function(res) {
				if (res) paella.player.pause();
				else paella.player.play();
			});

			self.showDialog(base.dictionary.translate("Saving your changes, please wait..."));

			// DataDelegate: check for implemented DataDelegate
			if (typeof paella.dataDelegates.CaptionsEditorDataDelegate === 'undefined') {
				self.onSaveCallback(null, base.dictionary.translate("Subtitle saving is not implemented"));
			}
			// DataDelegate: wait for implemented DataDelegate response
			else {
				paella.data.write('captionsEditor', {id:paella.initDelegate.getId()}, self._activeCaptionsToSaveObject(), (response,status) => {
					if (status) {
						self.onSaveCallback((typeof response === 'object' ? JSON.stringify(response) : response), null, nextActiveCaptions);
					}
					else {
						self.onSaveCallback(null, base.dictionary.translate("Your subtitle changes couldn't be saved: no response from the subtitling service"), nextActiveCaptions);
					}
				});
			}
		}

		onSaveCallback(response, error, nextActiveCaptions) {
			var self = this;

			this.closeAllDialogs();
			if (typeof error !== 'undefined' && error)
				this.showDialog(error);
			else if (response) {
				self._editedIndexes = [];
				self._removedIndexes = [];
				this.showDialog(response);
			}
		}

		checkDiscardChanges(nextActiveCaptions) {
			var self = this;
			if (self._editedIndexes.length || self._removedIndexes.length) {
				self.showDialog(base.dictionary.translate('You have made changes to the subtitles. If you continue without saving, all your changes will be lost.'), '<button id="captionsEditorDialogSaveAndContinueButton" class="captionsEditorButton">' + base.dictionary.translate('Save and continue') + '</button>');
				$('#captionsEditorDialogSaveAndContinueButton').click(function(e) {
					self.save(nextActiveCaptions);
				});
				$('#captionsEditorDialogExitButton').click(function(e) {
					self._editedIndexes = [];
					self._removedIndexes = [];
					self._activeCaptions = nextActiveCaptions;
				});
			}
			else {
				self._editedIndexes = [];
				self._removedIndexes = [];
				self._activeCaptions = nextActiveCaptions;
			}
		}

		export(format) {
		    if (!this._activeCaptions) return false;

		    var self = this;
		    let mimeType, textData;

		    if (format == 'srt') {
		      // Export to SubRip (SRT)
		      textData = self._activeCaptions._captions.reduce((text, sub, index) => {
		        return text + (index+1) + "\n" + self._timeFormat(sub.begin, 3, ',') + " --> " + self._timeFormat(sub.end, 3, ',') + "\n" + sub.content.replace(/"/g, "&quot;").replace(/<br>/g, "\n").replace(/\/([^\/]*)\/([^\/]*)\//gi, "$2").replace(/\s\[hesitation\]/gi, "").replace(/\[hesitation\]\s/gi, "").replace(/\[hesitation\]/gi, "") + "\n\n";
		      }, "");
		      mimeType = 'text/srt';
		    }

		    if (format == 'vtt') {
		      // Export to WebVTT
		      textData = "WEBVTT\n\n";
		      textData += self._activeCaptions._captions.reduce((text, sub, index) => {
		        return text + (index+1) + "\n" + self._timeFormat(sub.begin, 3, '.') + " --> " + self._timeFormat(sub.end, 3, '.') + "\n" + sub.content.replace(/"/g, "&quot;").replace(/<br>/g, "\n").replace(/\/([^\/]*)\/([^\/]*)\//gi, "$2").replace(/\s\[hesitation\]/gi, "").replace(/\[hesitation\]\s/gi, "").replace(/\[hesitation\]/gi, "") + "\n\n";
		      }, "");
		      mimeType = 'text/vtt';
		    }

		    if (format == 'txt') {
		      // Export to plain text
		      textData = self._activeCaptions._captions.reduce((text, sub, index) => {
		        return text + sub.content.replace(/"/g, "&quot;").replace(/<br>/g, "\n").replace(/\/([^\/]*)\/([^\/]*)\//gi, "$2").replace(/\s\[hesitation\]/gi, "").replace(/\[hesitation\]\s/gi, "").replace(/\[hesitation\]/gi, "") + "\n";
		      }, "");
		      mimeType = 'text/plain';
		    }

		    if (format == 'jsn') {
		      // IBM JSON
		      let ibmJson = {
		        "results": []
		      };

		      self._activeCaptions._captions.forEach((sub) => {
		        let alts = {
		          "alternatives": [{
		            "timestamps": [[sub.content, sub.begin, sub.end]],
		            "confidence": 1.0,
		            "word_confidence": [1.0],
		            "transcript": sub.content
		          }],
		          "final": true
		        };
		        
		        ibmJson.results.push(alts);
		      });

		      textData = JSON.stringify(ibmJson, null, 2);
		      mimeType = 'application/json';
		      format = 'json';
		    }

		    let a = document.createElement('a');
		    a.setAttribute("href", window.URL.createObjectURL(new Blob([textData], {type: mimeType+";charset=utf-8"})));
		    a.setAttribute("download", (paella.player.videoIdentifier ? paella.player.videoIdentifier : "captions") + "." + format);
		    document.body.appendChild(a);
		    a.click();
		    window.URL.revokeObjectURL(a.href);
	    }

	    exportDialog() {
	    	var self = this;

	    	// Pause if playing
				paella.player.playing().then(function(res) {
					if (res) paella.player.pause();
					else paella.player.play();
				});

	    	let htmlStr = '\
					<h5>Select the subtitles format:</h5>\
					<div class="select">\
	            <select id="captionsEditorExportFormat">\
	              <option value="srt">SubRip (srt)</option>\
	              <option value="vtt">WebVTT (vtt)</option>\
	              <option value="jsn">IBM (json)</option>\
	              <option value="txt">Text (txt)</option>\
	            </select>\
	            <div class="select__arrow"></div>\
	        </div>';
				let htmlButtons = '<button id="captionsEditorDialogExportButton" class="captionsEditorButton">Descargar</button>';
				this.showDialog(htmlStr, htmlButtons);
				$('#captionsEditorDialogExportButton').click(function(e) {
					self.export($('#captionsEditorExportFormat').val());
					self.closeAllDialogs();
				});
	    }

		import(file) {
		    if (!this._activeCaptions) return false;

		    var self = this;

		    if (window.File && window.FileReader && window.FileList && window.Blob) {
		      let fr = new FileReader();
		      fr.onload = (e) => {
		        let subs = [];
		        let fileExtension = /(?:\.([^.]+))?$/.exec(file.name)[1];

						// TODO
		        if (fileExtension == 'srt' || typeof fileExtension === 'undefined') subs = self.parseSrt(e.target.result);
		        else if (fileExtension == 'vtt') subs = self.parseVtt(e.target.result);
		        else {
		          self.showDialog('Subtitles format not supported');
		        }
		        
		        if (subs.length > 0) {
		        }
		        else {
		        	self.showDialog('Error reading subtitles file');
		        }
		      };
		      fr.readAsText(file);
		    }
		    else {
		    	self.showDialog('Your browser does not support HTML5 File API');
		    }
		}

		importDialog() {
			// Pause if playing
			paella.player.playing().then(function(res) {
				if (res) paella.player.pause();
				else paella.player.play();
			});

			let htmlStr = '\
			<p>' + base.dictionary.translate("The imported subtitles will replace the current target language subtitles.") + '</p>\
			<input id="captionsEditorImportInput" type="file" accept=".srt,.vtt" />\
			<p style="margin-top: 5px; color: #777; font-size: small">' + base.dictionary.translate("Supported formats") + ': SubRip (.srt), WebVTT (.vtt)</p>';
			let htmlButtons = '<button id="captionsEditorDialogImportButton" class="captionsEditorButton">' + base.dictionary.translate("Import") + '</button>';
			this.showDialog(htmlStr, htmlButtons);
			$('#captionsEditorDialogImportButton').click(function(e) {
				self.import($('#captionsEditorImportInput').val());
				self.closeAllDialogs();
			});
		}

		showHelp() {
			var self = this;
			let htmlStr = '\
			<h3>' + base.dictionary.translate("Shortcuts") + '</h3>\
			<ul>\
			  <li>' + base.dictionary.translate("Edit/Confirm current segment") + ': <strong>Enter</strong></li>\
				<li>' + base.dictionary.translate("Play/Pause") + ': <strong>TAB</strong></li>\
				<li>' + base.dictionary.translate("Replay current segment") + ': <strong>Shift + TAB</strong></li>\
				<li>' + base.dictionary.translate("Go to previous segment") + ': <strong>&uarr;</strong></li>\
				<li>' + base.dictionary.translate("Go to next segment") + ': <strong>&darr;</strong></li>\
			</ul>\
			';
			this.showDialog(htmlStr);
		}

		showDialog(htmlString, buttons) {
			var self = this;

			self.closeAllDialogs();

			// Add buttons
			htmlString += '<div style="text-align: right; margin-top: 10px;">' + (buttons ? buttons : '') + '\
					<button id="captionsEditorDialogExitButton" class="captionsEditorButton"> ' + base.dictionary.translate("Close") + '</button>\
				</div>';

			$('<div class="captionsEditorDialog"><div class="captionsEditorDialogBody">' + htmlString + '</div></div>').appendTo(document.body);
			$('#captionsEditorDialogExitButton').click(function(e) {
				self.closeAllDialogs();
			});
		}

		closeAllDialogs() {
			$('.captionsEditorDialog').remove();
		}
	}
});

/* To define by external caption providers */
/*
paella.addDataDelegate("captionsEditor", () => {
	return class CaptionsEditorDataDelegate extends paella.DataDelegate {
		write(context, videoMetadata, captionsObject, onSuccess) {			
			if (typeof(onSuccess)=='function') {
				// response message, error message || false
				onSuccess(base.dictionary.translate("Your subtitle changes have been saved"), false);
			}
		}
	};
});
*/