
paella.plugins.ActiveCaptionsPlugin = Class.create(paella.ButtonPlugin,{
	button: null,
	availableLangs: [],
	
	
	
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showCaptionsPluginButton"; },
	getIndex:function() { return 580; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.activeCaptionsPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Show captions 2"); },
	checkEnabled:function(onSuccess) {	
		var thisClass = this;		
		paella.data.read('captions',{id:paella.initDelegate.getId(),op:'langs'},function(data, status) {
			if (data && typeof(data)=='object' && (data.error === false)) {			
				if (data.langs && data.langs.length>0) {
					thisClass.availableLangs = data.langs;
					onSuccess(true);
				}
				else {
					onSuccess(false);
				}
			}
			else {			
				onSuccess(false);
			}
		});
	},
	
	buildContent:function(domElement) {
		var thisClass = this;
		
		var selectLang = document.createElement('div');
        selectLang.className = 'selectLang';

        var label = document.createElement('label');
        label.innerHTML = paella.dictionary.translate("Languages");
                
        var combo = document.createElement('select');
        combo.id = 'master';
        $(combo).change(function() {
            var param1Q = $(combo).val();
            thisClass.changeCaptions(param1Q, combo.id);
        });
        var noneOption = document.createElement('option');
        noneOption.value = '';
        noneOption.innerHTML = "None";
		noneOption.setAttribute('selected', true);
        combo.appendChild(noneOption);    
	

        
        this.availableLangs.forEach(function(lang){
            var option = document.createElement('option');
            option.value = lang.code;
            option.innerHTML = lang.text;
            if (lang.code=="none"){
				option.setAttribute('selected', true);
			}
            combo.appendChild(option);    
	        
        });

	
        selectLang.appendChild(label);
        selectLang.appendChild(combo);
	
		domElement.appendChild(selectLang);
	},
	
	
	changeCaptions:function(newLang, combo) {
        var thisClass = this;

		if (newLang != '')
			paella.data.read('captions',{id:paella.initDelegate.getId(),lang:newLang ,op:'caption'},function(data, status) {
				if (data && typeof(data)=='object' && (data.error === false)) {				
					if (data.captions && data.captions.length>0) {
						paella.plugins.captionsPlayerlugin.setCaptions(data.captions);
						paella.plugins.captionsPlayerlugin.enable();
						thisClass.changeSubclass(thisClass.getSubclass() + " selected");
					}
					else if (data.url && data.format) {
						paella.plugins.captionsPlayerlugin.loadCaptions(data.url, data.format, function(err){
							if (!err) {
								paella.plugins.captionsPlayerlugin.enable();
								thisClass.changeSubclass(thisClass.getSubclass() + " selected");
							}
						});	
					}
				}
			});
		else {
			thisClass.changeSubclass(thisClass.getSubclass());
			paella.plugins.captionsPlayerlugin.disable();
		}

		paella.events.trigger(paella.events.hidePopUp, {identifier:this.getName()});
    }
});
  

paella.plugins.activeCaptionsPlugin = new paella.plugins.ActiveCaptionsPlugin();

