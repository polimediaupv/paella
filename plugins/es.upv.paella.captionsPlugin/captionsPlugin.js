paella.addPlugin(function() {
	return class CaptionsPlugin extends paella.ButtonPlugin {
		getInstanceName() { return "captionsPlugin"; }	// plugin instance will be available in paella.plugins.captionsPlugin
		getAlignment() { return 'right'; }
		getSubclass() { return 'captionsPluginButton'; }
		getIconClass() { return 'icon-captions'; }
		getName() { return "es.upv.paella.captionsPlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		getDefaultToolTip() { return base.dictionary.translate("Subtitles"); }
		getIndex() { return 509; }
		closeOnMouseOut() { return false; }
	
		checkEnabled(onSuccess) {
			this._searchTimerTime = 1500;
			this._searchTimer = null;
			this._pluginButton = null;
			this._open = 0; // 0 closed, 1 st clic;
			this._parent = null;
			this._body = null;
			this._inner = null;
			this._bar = null;
			this._input = null;
			this._select = null;
			this._editor = null;
			this._activeCaptions = null;
			this._lastSel = null;
			this._browserLang = null;
			this._defaultBodyHeight = 280;
			this._autoScroll = true;
			this._searchOnCaptions = null;

			onSuccess(true);
		}
	
		showUI(){
			if(paella.captions.getAvailableLangs().length>=1){
				super.showUI();
			}
		}
	
		setup() {
			
	
			// HIDE UI IF NO Captions
			if(!paella.captions.getAvailableLangs().length){
				paella.plugins.captionsPlugin.hideUI();
			}
	
			//BINDS
			paella.events.bind(paella.events.captionsEnabled,(event,params)=> {
				onChangeSelection(params);
			});
	
			paella.events.bind(paella.events.captionsDisabled,(event,params)=>{
				onChangeSelection(params);
			});
	
			paella.events.bind(paella.events.captionAdded,(event,params)=>{
				onCaptionAdded(params);
				paella.plugins.captionsPlugin.showUI();
			});
	
			paella.events.bind(paella.events.timeUpdate, (event,params)=>{
				if(_searchOnCaptions){
					updateCaptionHiglighted(params);				
				}
	
			});
	
			paella.events.bind(paella.events.controlBarWillHide, (evt)=>{
				cancelHideBar();
			});
	
			_activeCaptions = paella.captions.getActiveCaptions();
	
			_searchOnCaptions = config.searchOnCaptions || false;
		}
	
		cancelHideBar() {
			var thisClass = this;
			if(thisClass._open > 0){
				paella.player.controls.cancelHideBar();
			}
		}
	
		updateCaptionHiglighted(time) {
			var thisClass = this;
			var sel = null;
			var id = null;
			if(time){
				paella.player.videoContainer.trimming()
					.then((trimming) => {
						let offset = trimming.enabled ? trimming.start : 0;
						let c = paella.captions.getActiveCaptions();
						let caption = c && c.getCaptionAtTime(time.currentTime + offset);
						let id = caption && caption.id;
	
						if(id != null){
							sel = $( ".bodyInnerContainer[sec-id='"+id+"']" );
	
							if(sel != thisClass._lasSel){
								$(thisClass._lasSel).removeClass("Highlight");
							}
	
							if(sel){
								$(sel).addClass("Highlight");
								if(thisClass._autoScroll){
									thisClass.updateScrollFocus(id);
								}
								thisClass._lasSel = sel;
							}
						}
					});
			}
		}
	
		updateScrollFocus(id) {
			var thisClass = this;
			var resul = 0;
			var t = $(".bodyInnerContainer").slice(0,id);
			t = t.toArray();
	
			// CANT CHANGE THIS LINE
			t.forEach(function(l){
				var i = $(l).outerHeight(true);
				resul += i;
			});
	
			var x = parseInt(resul / 280);
			$(".captionsBody").scrollTop( x*thisClass._defaultBodyHeight );
		}
	
		onCaptionAdded(obj) {
			var thisClass = this;
	
			var newCap = paella.captions.getCaptions(obj);
	
			var defOption = document.createElement("option"); // NO ONE SELECT
			defOption.text = newCap._lang.txt;
			defOption.value = obj;
	
			thisClass._select.add(defOption);
		}
	
		changeSelection() {
			var thisClass = this;
	
			var sel = $(thisClass._select).val();
			   if(sel == ""){ 
				   $(thisClass._body).empty();
				   paella.captions.setActiveCaptions(sel);
				   return;
			   } // BREAK IF NO ONE SELECTED
			paella.captions.setActiveCaptions(sel);
			thisClass._activeCaptions = sel;
			if(thisClass._searchOnCaptions){
				thisClass.buildBodyContent(paella.captions.getActiveCaptions()._captions,"list");	
			}
			thisClass.setButtonHideShow();
		}
		
		onChangeSelection(obj) {
			var thisClass = this;
	
			if(thisClass._activeCaptions != obj){
				$(thisClass._body).empty();
				if(obj==undefined){
					thisClass._select.value = "";
					$(thisClass._input).prop('disabled', true);
				}
				else{
					$(thisClass._input).prop('disabled', false);
					thisClass._select.value = obj;
					if(thisClass._searchOnCaptions){
						thisClass.buildBodyContent(paella.captions.getActiveCaptions()._captions,"list");
					}
				}
				thisClass._activeCaptions = obj;
				thisClass.setButtonHideShow();
			}
		}
	
		action() {
			
			_browserLang = base.dictionary.currentLanguage();
			_autoScroll = true;
	
			switch(_open){
				case 0:
					if(_browserLang && paella.captions.getActiveCaptions()==undefined){
						selectDefaultBrowserLang(_browserLang);
					}
					_open = 1;
					paella.keyManager.enabled = false;
					break;
			
				case 1: 
					paella.keyManager.enabled = true;
					_open = 0;
					break;
			}
		}
	
		buildContent(domElement) {
			//var thisClass = this;
	
			//captions CONTAINER
			_parent = document.createElement('div');
			_parent.className = 'captionsPluginContainer';  
			//captions BAR
			 _bar = document.createElement('div');
			_bar.className = 'captionsBar';
			//captions BODY
			if(_searchOnCaptions){
				_body = document.createElement('div');
				_body.className = 'captionsBody';
				_parent.appendChild(thisClass._body);
				 //BODY JQUERY
				$(_body).scroll(()=>{
					_autoScroll = false;
				});
	
				//INPUT
				_input = document.createElement("input");
				_input.className = "captionsBarInput";
				_input.type = "text";
				_input.id ="captionsBarInput";
				_input.name = "captionsString";
				_input.placeholder = base.dictionary.translate("Search captions");
				_bar.appendChild(_input);
	
				//INPUT jQuery
				 $(_input).change(()=>{
					var text = $(_input).val();
					thisClass.doSearch(text);
				});
	
				$(_input).keyup(()=>{
					var text = $(_input).val();
					if(_searchTimer != null){
						_searchTimer.cancel();
					}
					_searchTimer = new base.Timer((timer)=> {
						doSearch(text);
					}, _searchTimerTime);			
				});
			}
	
				
	
			//SELECT
			_select = document.createElement("select");
			_select.className = "captionsSelector";
			
			var defOption = document.createElement("option"); // NO ONE SELECT
			defOption.text = base.dictionary.translate("None");
			defOption.value = "";
			_select.add(defOption);
	
	// CANT CHANGE THIS LINE
			paella.captions.getAvailableLangs().forEach(function(l){
				var option = document.createElement("option");
				option.text = l.lang.txt;
				option.value = l.id;
				_select.add(option);
			});
	
			_bar.appendChild(thisClass._select);
			_parent.appendChild( thisClass._bar);
	
			//jQuery SELECT
			$(_select).change(()=> {
			changeSelection();
			});
	
			//BUTTON EDITOR
			_editor = document.createElement("button");
			_editor.className = "editorButton";
			_editor.innerText = "";
			_bar.appendChild(thisClass._editor);
	
			//BUTTON jQuery
			$(_editor).prop("disabled",true);
			$(_editor).click(()=>{
				var c = paella.captions.getActiveCaptions();        	
				paella.userTracking.log("paella:caption:edit", {id: c._captionsProvider + ':' + c._id, lang: c._lang});
				c.goToEdit();
			});
	
			domElement.appendChild(_parent);
		}
	
		selectDefaultBrowserLang(code) {
			var thisClass = this;
			var provider = null;
			//cant change this line
			paella.captions.getAvailableLangs().forEach(function(l){
				if(l.lang.code == code){ provider = l.id; }
			});
			
			if(provider){
				paella.captions.setActiveCaptions(provider);
			}
			/*
			else{
				$(thisClass._input).prop("disabled",true);
			}
			*/
	
		}
	
		doSearch(text) {
			var thisClass = this;
			var c = paella.captions.getActiveCaptions();
			if(c){
				if(text==""){thisClass.buildBodyContent(paella.captions.getActiveCaptions()._captions,"list");}
				else{
					c.search(text,(err,resul)=>{
						if(!err){
							thisClass.buildBodyContent(resul,"search");
						}
					});
				}
			}
		}
	
		setButtonHideShow() {
			var thisClass = this;
			var editor = $('.editorButton');
			var c = paella.captions.getActiveCaptions();
			var res = null;
			   if(c!=null){
				   $(thisClass._select).width('39%');
				
				c.canEdit((err,resul)=>{res=r;});
				if(res){
					$(editor).prop("disabled",false);
					$(editor).show();
				}
				else{
					$(editor).prop("disabled",true);
					$(editor).hide();
					$(thisClass._select).width('47%');
				}
			}
			else {
				$(editor).prop("disabled",true);
				$(editor).hide();
				$(thisClass._select).width('47%');
			}

			if(!thisClass._searchOnCaptions){
				if(res){$(thisClass._select).width('92%');}
				else{$(thisClass._select).width('100%');}
			 }
		}

		buildBodyContent(obj,type) {
			paella.player.videoContainer.trimming()
				.then((trimming)=>{
					var thisClass = this;
					$(thisClass._body).empty();
					//cant change this line
					obj.forEach(function(l){
						if(trimming.enabled && (l.end<trimming.start || l.begin>trimming.end)){
							return;
						}
						thisClass._inner = document.createElement('div');
						thisClass._inner.className = 'bodyInnerContainer';
						thisClass._inner.innerText = l.content;
						if(type=="list"){
							thisClass._inner.setAttribute('sec-begin',l.begin);
							thisClass._inner.setAttribute('sec-end',l.end);
							thisClass._inner.setAttribute('sec-id',l.id);
							thisClass._autoScroll = true;
						}
						if(type=="search"){
							thisClass._inner.setAttribute('sec-begin',l.time);
						}
						thisClass._body.appendChild(thisClass._inner);
	
						//JQUERY
						$(thisClass._inner).hover(
							()=>{ 
								$(this).css('background-color','rgba(250, 161, 102, 0.5)');	           		
							},
							()=>{ 
								$(this).removeAttr('style');
							}
						);
						$(thisClass._inner).click(()=>{ 
								var secBegin = $(this).attr("sec-begin");
								paella.player.videoContainer.trimming()
									.then((trimming) => {
										let offset = trimming.enabled ? trimming.start : 0;
										paella.player.videoContainer.seekToTime(secBegin - offset + 0.1);
									});
						});
					});
			});
		}
	}
	
});