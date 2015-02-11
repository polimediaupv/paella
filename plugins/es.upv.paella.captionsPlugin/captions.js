Class ("paella.plugins.CaptionsPlugin", paella.ButtonPlugin,{

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return 'captionsPlugin'; },
	getName:function() { return "es.upv.paella.captionsPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Subtitles"); },
	getIndex:function() {return 2050;},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {

	},

	buildContent:function(domElement) {
		var thisClass = this;
		var myUrl = null;

		//captions CONTAINER
		var captionsPluginContainer = document.createElement('div');
        captionsPluginContainer.className = 'captionsPluginContainer';
	        
	        //captions BODY
	        var captionsBody = document.createElement('div');
	        captionsBody.className = 'captionsBody';
	        captionsPluginContainer.appendChild(captionsBody);


	    //captions BAR
	    var captionsBar = document.createElement('div');
        captionsBar.className = 'captionsBar';
        captionsPluginContainer.appendChild(captionsBar);

	        //INPUT
	        var input = document.createElement("input");
	        input.className = "captionsBarInput";
	        input.type = "text";
	        input.id ="captionsBarInput";
	        input.name = "captionsString";
	        input.placeholder = base.dictionary.translate("captions");
	        captionsBar.appendChild(input);

	        //SELECT
	        var select = document.createElement("select");
	        select.className = "captionsSelector";
	        for(var i=0;i<paella.captions.getLangs().length;i++){ // GET NUMBER OF LANGS
	        	var option = document.createElement("option");
	        	option.text = paella.captions.getLangs()[i];
	        	select.add(option);
	        }
	        	var defOption = document.createElement("option"); // NO ONE SELECT
	        	defOption.text = "ninguno";
	        	select.add(defOption);

	        captionsBar.appendChild(select);



	        //BUTTON EDITOR
	        var editor = document.createElement("button");
	        editor.className = "editorButton";
	        editor.innerHTML = "Editor";
	        captionsBar.appendChild(editor);


        domElement.appendChild(captionsPluginContainer);

    },

});

paella.plugins.captionsPlugin = new paella.plugins.CaptionsPlugin();

/* INPUTS CONTROL 

			$(input).change(function(){
	        	var text = $(input).val();
	        	thisClass.docaptions(text, captionsBody);
			});

			$(input).keyup(function(){
				var text = $(input).val();
				if(thisClass._captionsTimer != null){
					thisClass._captionsTimer.cancel();
				}
				thisClass._captionsTimer = new base.Timer(function(timer) {
					thisClass.docaptions(text, captionsBody);
				}, thisClass._captionsTimerTime);			
			});
*/