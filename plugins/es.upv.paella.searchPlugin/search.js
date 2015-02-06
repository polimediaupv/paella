Class ("paella.plugins.SearchPlugin", paella.ButtonPlugin,{
	_open: false,
	_sortDefault: 'score',
	_colorSearch: true,


	getAlignment:function() { return 'right'; },
	getSubclass:function() { return 'searchButton'; },
	getName:function() { return "es.upv.paella.searchPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Search"); },
	getIndex:function() {return 510;},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {
		var self = this;
		$('.searchButton').click(function(event){
			if(self._open){
				paella.events.trigger(paella.events.play);
				paella.keyManager.enabled = true;
				self._open = false;
			}
			else {
				paella.events.trigger(paella.events.pause);
				paella.keyManager.enabled = false;
				self._open = true;
				setTimeout(function(){
   					 $("#searchBarInput").focus();
				}, 0);
				}
		});
	},


	search:function(text,cb){
		setTimeout(function(){
			cb(true,[
				{
				time:124,
				caption:"Hola mundo que tal?",
				score:0.2
				},
				{
				time:300,
				caption:"Hola mundo que tal?",
				score:0.5
				},
				{
				time:1300,
				caption:"Hola mundo que tal?",
				score:0.75
				},
				{
				time:487,
				caption:"Hola mundo que tal?",
				score:0.15
				},
				{
				time:679,
				caption:"Hola mundo que tal?",
				score:0.6
				},
				{
				time:1174,
				caption:"Hola mundo que tal?",
				score:0.3
				}
				]);
		}, 2000);
	},

	buildContent:function(domElement) {
		var thisClass = this;

		//SEARCH CONTAINER
		var searchPluginContainer = document.createElement('div');
        searchPluginContainer.className = 'searchPluginContainer';
	        
	        //SEARCH BODY
	        var searchBody = document.createElement('div');
	        searchBody.className = 'searchBody';
	        searchPluginContainer.appendChild(searchBody);


	    //SEARCH BAR
	    var searchBar = document.createElement('div');
        searchBar.className = 'searchBar';
        searchPluginContainer.appendChild(searchBar);

	        //INPUT
	        var input = document.createElement("input");
	        input.className = "searchBarInput";
	        input.type = "text";
	        input.id ="searchBarInput";
	        input.name = "searchString";
	        input.placeholder = base.dictionary.translate("Search");
	        searchBar.appendChild(input);

	        $(input).change(function(){
	        	var text = $(input).val();

				thisClass.search(text,function(err, results){
				//BUILD SEARCH RESULTS
				if(err){
					for(var i=0; i<results.length; i++){

			        	//SEARCH SORT TYPE (TIME oR SCoRE)
			        	if(thisClass._sortDefault == 'score') {
				        	results.sort(function(a,b){
								return b.score - a.score;
							});
				        }
						if(thisClass._sortDefault == 'time') {
				        	results.sort(function(a,b){
								return a.time - b.time;
							});
				    	}

						var sBodyInnerContainer = document.createElement('div');
			        	sBodyInnerContainer.className = 'sBodyInnerContainer';
			        	//COLOR?
			        	//g rgba(0, 255, 0, 0.2)
						//r rgba(255, 0, 0, 0.2);
			        	if(thisClass._colorSearch){ 

			        		if(results[i].score <= 0.3)
			        		sBodyInnerContainer.style.backgroundColor="rgba(255, 0, 0, 0.2)";

			        		if(results[i].score >= 0.7)
			        		sBodyInnerContainer.style.backgroundColor="rgba(0, 255, 0, 0.2)";
			        	}

			        	var TimePicContainer = document.createElement('div');
			        	TimePicContainer.className = 'TimePicContainer';

			        	var sBodyPicture = document.createElement('img');
			        	sBodyPicture.className = 'sBodyPicture';
			        	sBodyPicture.src ='http://paellaplayer.upv.es/demo/repository/belmar-multiresolution/slides/46561b90-85b3-4ad7-a986-cdd9b52ae02b/presentation_cut.jpg';

			        	var sBodyText = document.createElement('p');
			        	sBodyText.className = 'sBodyText';
			        	sBodyText.innerHTML = "<span class=\"timeSpan\">"+results[i].time+"</span>"+results[i].caption;


			        	TimePicContainer.appendChild(sBodyPicture);
			        	

			        	sBodyInnerContainer.appendChild(TimePicContainer);
			        	sBodyInnerContainer.appendChild(sBodyText);
			        	

			        	searchBody.appendChild(sBodyInnerContainer);
			        	//ADD SECS TO DOM FOR EASY HANDLE
			        	sBodyInnerContainer.setAttribute('sec',results[i].time);

			        	//jQuery Binds for the search
			        	$(sBodyInnerContainer).hover(
			        		function(){ 
			        			$(this).addClass('hover');	           		
			        		},
			        		function(){ $(this).removeClass('hover'); 
			        		}
			        	);

			        	$(sBodyInnerContainer).click(function(){ 
			        		var sec = $(this).attr("sec");
			        		paella.player.videoContainer.seekToTime(sec);
			        	});
					}
						
					}
			    });
			});

        domElement.appendChild(searchPluginContainer);

    },

});

paella.plugins.searchPlugin = new paella.plugins.SearchPlugin();