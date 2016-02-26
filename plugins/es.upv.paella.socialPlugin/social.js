Class ("paella.plugins.SocialPlugin",paella.ButtonPlugin,{
	buttonItems: null,
	socialMedia: null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showSocialPluginButton"; },
	getIndex:function() { return 560; },
	getMinWindowSize:function() { return 600; },
	getName:function() { return "es.upv.paella.socialPlugin"; },
	checkEnabled:function(onSuccess) { onSuccess(true); },
	getDefaultToolTip:function() { return base.dictionary.translate("Share this video"); },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	buttons: [],
	selected_button: null,


    initialize:function() {
        this.parent();
        if (base.dictionary.currentLanguage()=='es') {
            var esDict = {
                'Custom size:': 'Tamaño personalizado:',
                'Choose your embed size. Copy the text and paste it in your html page.': 'Elija el tamaño del video a embeber. Copie el texto y péguelo en su página html.',
                'Width:':'Ancho:',
                'Height:':'Alto:'
            };
            base.dictionary.addDictionary(esDict);
        }
    },

	setup:function() {
		var thisClass = this;

    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	if(thisClass.isPopUpOpen()) {
		    	if (event.keyCode == Keys.Up) {
		           if(thisClass.selected_button>0){
			            if(thisClass.selected_button<thisClass.buttons.length)
				            thisClass.buttons[thisClass.selected_button].className = 'socialItemButton '+thisClass.buttons[thisClass.selected_button].data.mediaData;

					    thisClass.selected_button--;
					    thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
		           	}
	            }
	            else if (event.keyCode == Keys.Down) {
	            	if(thisClass.selected_button<thisClass.buttons.length-1){
	            		if(thisClass.selected_button>=0)
	            			thisClass.buttons[thisClass.selected_button].className = 'socialItemButton '+thisClass.buttons[thisClass.selected_button].data.mediaData;

	            		thisClass.selected_button++;
	               		thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	                thisClass.onItemClick(thisClass.buttons[thisClass.selected_button].data.mediaData);
	            }
        	}
        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		socialMedia = ['facebook','twitter', 'embed'];
		socialMedia.forEach(function(mediaData) {
		  var buttonItem = thisClass.getSocialMediaItemButton(mediaData);
		  thisClass.buttonItems[socialMedia.indexOf(mediaData)] = buttonItem;
		  domElement.appendChild(buttonItem);
		  thisClass.buttons.push(buttonItem);
		});
		this.selected_button = thisClass.buttons.length;
	},

	getSocialMediaItemButton:function(mediaData) {
		var elem = document.createElement('div');
		elem.className = 'socialItemButton ' + mediaData;
		elem.id = mediaData + '_button';
		elem.data = {
			mediaData:mediaData,
			plugin:this
		};
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this.data.mediaData);
		});
		return elem;
	},

	onItemClick:function(mediaData) {
		var url = this.getVideoUrl();
		switch (mediaData) {
			case ('twitter'):
				window.open('http://twitter.com/home?status=' + url);
				break;
			case ('facebook'):
				window.open('http://www.facebook.com/sharer.php?u=' + url);
				break;
			case ('embed'):
				this.embedPress();
				break;
		}
		paella.player.controls.hidePopUp(this.getName());
	},

	getVideoUrl:function() {
		var url = document.location.href;
		return url;
	},

    embedPress:function() {
        var host = document.location.protocol + "//" +document.location.host;
        var pathname = document.location.pathname;

        var p = pathname.split("/");
        if (p.length > 0){p[p.length-1] = "embed.html";}
		var id = paella.initDelegate.getId();
        var url = host+p.join("/")+"?id="+id;
        //var paused = paella.player.videoContainer.paused();
        //$(document).trigger(paella.events.pause);


        var divSelectSize="<div style='display:inline-block;'> " +
            "    <div class='embedSizeButton' style='width:110px; height:73px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 620x349 </span></div>" +
            "    <div class='embedSizeButton' style='width:100px; height:65px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 540x304 </span></div>" +
            "    <div class='embedSizeButton' style='width:90px;  height:58px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 460x259 </span></div>" +
            "    <div class='embedSizeButton' style='width:80px;  height:50px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 380x214 </span></div>" +
            "    <div class='embedSizeButton' style='width:70px;  height:42px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 300x169 </span></div>" +
            "</div><div style='display:inline-block; vertical-align:bottom; margin-left:10px;'>"+
            "    <div>"+base.dictionary.translate("Custom size:")+"</div>" +
            "    <div>"+base.dictionary.translate("Width:")+" <input id='social_embed_width-input' class='embedSizeInput' maxlength='4' type='text' name='Costum width min 300px' alt='Costum width min 300px' title='Costum width min 300px' value=''></div>" +
            "    <div>"+base.dictionary.translate("Height:")+" <input id='social_embed_height-input' class='embedSizeInput' maxlength='4' type='text' name='Costum width min 300px' alt='Costum width min 300px' title='Costum width min 300px' value=''></div>" +
            "</div>";


        var divEmbed = "<div id='embedContent' style='text-align:left; font-size:14px; color:black;'><div id=''>"+divSelectSize+"</div> <div id=''>"+base.dictionary.translate("Choose your embed size. Copy the text and paste it in your html page.")+"</div> <div id=''><textarea id='social_embed-textarea' class='social_embed-textarea' rows='4' cols='1' style='font-size:12px; width:95%; overflow:auto; margin-top:5px; color:black;'></textarea></div>  </div>";


        paella.messageBox.showMessage(divEmbed, {
            closeButton:true,
            width:'750px',
            height:'210px',
            onClose:function() {
            //      if (paused == false) {$(document).trigger(paella.events.play);}
            }
        });
        var w_e = $('#social_embed_width-input')[0];
        var h_e = $('#social_embed_height-input')[0];
        w_e.onkeyup = function(event){
            var width = parseInt(w_e.value);
            var height = parseInt(h_e.value);
            if (isNaN(width)){
            	w_e.value="";
            }
            else{
                if (width<300){
                    $("#social_embed-textarea")[0].value = "Embed width too low. The minimum value is a width of 300.";
                }
                else{
                    if (isNaN(height)){
                        height = (width/(16/9)).toFixed();
                        h_e.value = height;
                    }
                    $("#social_embed-textarea")[0].value = '<iframe allowfullscreen src="'+url+'" style="border:0px #FFFFFF none;" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="'+width+'" height="'+height+'"></iframe>';
                }
            }
        };
        var embs = $(".embedSizeButton");
        for (var i=0; i< embs.length; i=i+1){
            var e = embs[i];
            e.onclick=function(event){
                var value = event.target? event.target.textContent: event.toElement.textContent;
                if (value) {
                    var size = value.split("x");

                    w_e.value = size[0];
                    h_e.value = size[1];
                    $("#social_embed-textarea")[0].value = '<iframe allowfullscreen src="'+url+'" style="border:0px #FFFFFF none;" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="'+size[0]+'" height="'+size[1]+'"></iframe>';
                }
            };
        }
    }



});


paella.plugins.socialPlugin = new paella.plugins.SocialPlugin();
