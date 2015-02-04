Class ("paella.plugins.SearchPlugin", paella.ButtonPlugin,{
	_defaultState: false,

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return 'searchButton'; },
	getName:function() { return "es.upv.paella.searchPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Search text on captions"); },
	getIndex:function() {return 200;},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {
		$('.searchButton').click(function(event){
			if(paella.player.videoContainer.paused()){
				paella.events.trigger(paella.events.play);
				paella.keyManager.enabled = true;
			}
			else {
					paella.events.trigger(paella.events.pause);
					paella.keyManager.enabled = false;

				}
		});
	},

	buildContent:function(domElement) {
		var thisClass = this;

		//SEARCH CONTAINER
		var searchPluginContainer = document.createElement('div');
        searchPluginContainer.className = 'searchPluginContainer';

	        //SEARCH BAR
	        var searchBar = document.createElement('div');
	        searchBar.className = 'searchBar';
	        searchPluginContainer.appendChild(searchBar);

		        //INPUT
		        var input = document.createElement("input");
		        input.className = "searchBarInput";
		        input.type = "text";
		        input.name = "searchString";
		        input.placeholder = "ex: Fourier, Matrix, Hoffman... etc";
		        searchBar.appendChild(input);
	        
	        //SEARCH BODY
	        var searchBody = document.createElement('div');
	        searchBody.className = 'searchBody';
	        searchPluginContainer.appendChild(searchBody);

	        //MAKE THE SEARCH AND GET THE RESULTS AND FILL;
	        var elements = 5;

	        for(var i=0; i<elements; i++){
	        	var sBodyInnerContainer = document.createElement('div');
	        	sBodyInnerContainer.className = 'sBodyInnerContainer';

	        	var sBodyPicture = document.createElement('img');
	        	sBodyPicture.className = 'sBodyPicture';
	        	sBodyPicture.src ='http://paellaplayer.upv.es/demo/repository/belmar-multiresolution/slides/46561b90-85b3-4ad7-a986-cdd9b52ae02b/presentation_cut.jpg';

	        	var sBodyText = document.createElement('p');
	        	sBodyText.className = 'sBodyText';
	        	sBodyText.innerHTML = " Something of text";

	        	var sBodyTime = document.createElement('p');
	        	sBodyTime.className = 'sBodyTime';
	        	sBodyTime.innerHTML = " 00:13:01";

	        	sBodyInnerContainer.appendChild(sBodyPicture);
	        	sBodyInnerContainer.appendChild(sBodyText);
	        	sBodyInnerContainer.appendChild(sBodyTime);

	        	searchBody.appendChild(sBodyInnerContainer);
	        }

        domElement.appendChild(searchPluginContainer);

    },

});

paella.plugins.searchPlugin = new paella.plugins.SearchPlugin();