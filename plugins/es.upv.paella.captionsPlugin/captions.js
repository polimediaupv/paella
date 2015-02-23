Class ("paella.plugins.CaptionsPlugin", paella.ButtonPlugin,{
	_searchTimerTime:1500,
	_searchTimer:null,
	_pluginButton:null,
	_open:false,
	_parent:null,
	_body:null,
	_inner:null,
	_bar:null,
	_input:null,
	_select:null,
	_editor:null,
	_activeCaptions:null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return 'captionsPluginButton'; },
	getName:function() { return "es.upv.paella.captionsPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Subtitles"); },
	getIndex:function() {return 2050;},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {
		var self = this;
		
		//BINDS
		paella.events.bind(paella.events.captionsEnabled,function(event,params){
			self.onChangeSelection(params);
		});

		paella.events.bind(paella.events.captionsDisabled,function(event,params){
			self.onChangeSelection(params);
		});

		paella.events.bind(paella.events.captionAdded,function(event,params){
			self.onCaptionAdded(params);
		});

		self._activeCaptions = paella.captions.getActiveCaptions();

	},

	onCaptionAdded:function(obj){
		var thisClass = this;

		var newCap = paella.captions.getCaptions(obj);

		var defOption = document.createElement("option"); // NO ONE SELECT
        defOption.text = newCap._lang.txt;
        defOption.value = obj;

        thisClass._select.add(defOption);
	},

	changeSelection:function(){
		var thisClass = this;

		var sel = $(thisClass._select).val();
       	if(sel == ""){ 
       		$(thisClass._body).empty();
       		paella.captions.setActiveCaptions(sel);
       		return;
       	} // BREAK IF NO ONE SELECTED
		
		paella.captions.setActiveCaptions(sel);
		thisClass._activeCaptions = sel;
		thisClass.buildBodyContent(paella.captions.getActiveCaptions()._captions,"list");
		thisClass.setButtonHideShow();
	},
	
	onChangeSelection:function(obj){


		var thisClass = this;

		if(thisClass._activeCaptions != obj){
			$(thisClass._body).empty();
			if(obj==undefined){
				thisClass._select.value = "";
			}
			else{
				thisClass._select.value = obj; 
				thisClass.buildBodyContent(paella.captions.getActiveCaptions()._captions,"list");
			}
			thisClass._activeCaptions = obj;
			thisClass.setButtonHideShow();
		}
	},

	action:function(){
		var self = this;
			if(self.isPopUpOpen()){
				paella.events.trigger(paella.events.play);
				paella.keyManager.enabled = true;
			}
			else {
				paella.keyManager.enabled = false;
					if(self._input){
						setTimeout(function(){
							$(self._input).focus();
						}, 0);
					}		
				}
	},

	buildContent:function(domElement) {
		var thisClass = this;

		//captions CONTAINER
		thisClass._parent = document.createElement('div');
        thisClass._parent.className = 'captionsPluginContainer';
	        
	        //captions BODY
	        thisClass._body = document.createElement('div');
	        thisClass._body.className = 'captionsBody';
	        thisClass._parent.appendChild(thisClass._body);


	    //captions BAR
	    thisClass._bar = document.createElement('div');
        thisClass._bar.className = 'captionsBar';
        thisClass._parent.appendChild( thisClass._bar);

	        //INPUT
	        thisClass._input = document.createElement("input");
	        thisClass._input.className = "captionsBarInput";
	        thisClass._input.type = "text";
	        thisClass._input.id ="captionsBarInput";
	        thisClass._input.name = "captionsString";
	        thisClass._input.placeholder = base.dictionary.translate("Search captions");
	        thisClass._bar.appendChild(thisClass._input);

	        //INPUT jQuery
	         $(thisClass._input).change(function(){
	        	var text = $(thisClass._input).val();
	        	thisClass.doSearch(text);
			});

			$(thisClass._input).keyup(function(){
				var text = $(thisClass._input).val();
				if(thisClass._searchTimer != null){
					thisClass._searchTimer.cancel();
				}
				thisClass._searchTimer = new base.Timer(function(timer) {
					thisClass.doSearch(text);
				}, thisClass._searchTimerTime);			
			});

			$(thisClass._input).focus(function(){
   					 	paella.events.trigger(paella.events.pause);
   			});

	        //SELECT
	        thisClass._select = document.createElement("select");
	        thisClass._select.className = "captionsSelector";
	        
	        var defOption = document.createElement("option"); // NO ONE SELECT
	        defOption.text = base.dictionary.translate("None");
	        defOption.value = "";
	        thisClass._select.add(defOption);

	        paella.captions.getAvailableLangs().forEach(function(l){
	        	var option = document.createElement("option");
	        	option.text = l.lang.txt;
	        	option.value = l.id;
	        	thisClass._select.add(option);
	        });

	         thisClass._bar.appendChild(thisClass._select);

	        //jQuery SELECT
	        $(thisClass._select).change(function(){
		       thisClass.changeSelection();
	        });

	        //BUTTON EDITOR
	        thisClass._editor = document.createElement("button");
	        thisClass._editor.className = "editorButton";
	        thisClass._editor.innerHTML = "Editor";
	        thisClass._bar.appendChild(thisClass._editor);


		        //BUTTON jQuery
		        $(thisClass._editor).prop("disabled",true);
		        $(thisClass._editor).click(function(){
		        	var c = paella.captions.getActiveCaptions();
		        	c.gotoEdit();
		        });

        domElement.appendChild(thisClass._parent);

        //FOCUS AFTER 1st BUILD
        /*
		setTimeout(function(){
			$(thisClass._input).focus();
		}, 0);
		*/
    },

    doSearch:function(text){
    	thisClass = this;
		var c = paella.captions.getActiveCaptions();
		if(c){
			if(text==""){thisClass.buildBodyContent(paella.captions.getActiveCaptions()._captions,"list");}
			else{
				c.search(text,function(err,resul){
					if(!err){
						thisClass.buildBodyContent(resul,"search");
					}
				});
			}
		}
    },

    setButtonHideShow:function(){
    	var editor = $('.editorButton');
		var c = paella.captions.getActiveCaptions();
	   	if(c!=null){
		    var res = null;
		    c.canEdit(function(err, r){res=r;});
	        if(res){
	        	$(editor).prop("disabled",false);
	        }
	        else{
	        	$(editor).prop("disabled",true);
	        }
    	}
    	else {
    		$(editor).prop("disabled",true);
    	}

    },

    buildBodyContent:function(obj,type){
    	var thisClass = this;
    	$(thisClass._body).empty();
    	obj.forEach(function(l){
    		thisClass._inner = document.createElement('div');
        	thisClass._inner.className = 'bodyInnerContainer';
        	thisClass._inner.innerHTML = l.content;
        	if(type=="list"){
        		thisClass._inner.setAttribute('sec',l.begin);
        	}
        	if(type=="search"){
        		thisClass._inner.setAttribute('sec',l.time);
        	}
        	thisClass._body.appendChild(thisClass._inner);

        	//JQUERY
	        	$(thisClass._inner).hover(
	        		function(){ 
	        			$(this).css('background-color','#faa166');	           		
	        		},
	        		function(){ 
	        			$(this).removeAttr('style');
	        		}
		        );
		        $(thisClass._inner).click(function(){ 
		        		var sec = $(this).attr("sec");
		        		paella.player.videoContainer.seekToTime(parseInt(sec));
		        });
    	});
    }
});

paella.plugins.captionsPlugin = new paella.plugins.CaptionsPlugin();