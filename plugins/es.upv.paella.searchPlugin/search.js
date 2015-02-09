Class ("paella.plugins.SearchPlugin", paella.ButtonPlugin,{
	_open: false,
	_sortDefault: 'time',
	_colorSearch: false,
	_localImages: null,


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
		//GET THE FRAME LIST
		self._localImages = paella.initDelegate.initParams.videoLoader.frameList;
	},

	prettyTime:function(seconds){
		// TIME FORMAT
		var hou = Math.floor(seconds / 3600)%24;
		hou = ("00"+hou).slice(hou.toString().length);

		var min = Math.floor(seconds / 60)%60;
		min = ("00"+min).slice(min.toString().length);

		var sec = Math.floor(seconds % 60);
		sec = ("00"+sec).slice(sec.toString().length);
		var timestr = (hou+":"+min+":"+sec);

		return timestr;
	},

	search:function(text,cb){
		setTimeout(function(){
 		paella.captions.search(text, cb);
 	},3000);

		/*
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
		*/
	},

	getPreviewImage:function(time){
		var thisClass = this;
		var keys = Object.keys(thisClass._localImages);

		keys.push(time);

		keys.sort(function(a,b){
			return parseInt(a)-parseInt(b);
		});

		var n = keys.indexOf(time)-1;
		n = (n > 0) ? n : 0;

		var i = keys[n];
		i=parseInt(i);

		return thisClass._localImages[i].url;
	},

	createLoadingElement:function(parent){
		var loadingResults = document.createElement('div');
		loadingResults.className = "loader";

		var htmlLoader = "<svg version=\"1.1\" id=\"loader-1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"40px\" height=\"40px\" viewBox=\"0 0 50 50\" style=\"enable-background:new 0 0 50 50;\" xml:space=\"preserve\">"+
   		"<path fill=\"#000\" d=\"M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z\">"+
    	"<animateTransform attributeType=\"xml\""+
      	"attributeName=\"transform\""+
      	"type=\"rotate\""+
      	"from=\"0 25 25\""+
      	"to=\"360 25 25\""+
      	"dur=\"0.6s\""+
      	"repeatCount=\"indefinite\"/>"+
    	"</path>"+
  		"</svg>";
		loadingResults.innerHTML = htmlLoader;
		parent.appendChild(loadingResults);
		var sBodyText = document.createElement('p');
		sBodyText.className = 'sBodyText';
		sBodyText.innerHTML = base.dictionary.translate("Searching") + "...";
		parent.appendChild(sBodyText);
	},

	createNotResultsFound:function(parent){
		var noResults = document.createElement('div');
		noResults.className = "noResults";
		noResults.innerHTML = base.dictionary.translate("Sorry! No results found.");
		parent.appendChild(noResults);
	},

	doSearch: function(txt, searchBody) {
		var thisClass = this;
		$(searchBody).empty();

		//LOADING CONTAINER
		thisClass.createLoadingElement(searchBody);

	
		thisClass.search(txt, function(err, results){

		$(searchBody).empty();
		//BUILD SEARCH RESULTS
		if(!err){
			if(results.length == 0){ // 0 RESULTS FOUND
				thisClass.createNotResultsFound(searchBody);
			}
			else {
				for(var i=0; i<results.length; i++){ // FILL THE BODY CONTAINER WITH RESULTS

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
		        	
		        	//COLOR
		        	if(thisClass._colorSearch){ 

		        		if(results[i].score <= 0.3) {$(sBodyInnerContainer).addClass('redScore');}

		        		if(results[i].score >= 0.7) {$(sBodyInnerContainer).addClass('greenScore');}
		        	}

		        	var TimePicContainer = document.createElement('div');
		        	TimePicContainer.className = 'TimePicContainer';


		        	var sBodyPicture = document.createElement('img');
		        	sBodyPicture.className = 'sBodyPicture';
		        	sBodyPicture.src = thisClass.getPreviewImage(results[i].time);

		        	
		        	var sBodyText = document.createElement('p');
		        	sBodyText.className = 'sBodyText';
		        	sBodyText.innerHTML = "<span class='timeSpan'>"+thisClass.prettyTime(results[i].time)+"</span>"+results[i].content;


		        	TimePicContainer.appendChild(sBodyPicture);
		        	

		        	sBodyInnerContainer.appendChild(TimePicContainer);
		        	sBodyInnerContainer.appendChild(sBodyText);
		        	

		        	searchBody.appendChild(sBodyInnerContainer);
		        	//ADD SECS TO DOM FOR EASY HANDLE
		        	sBodyInnerContainer.setAttribute('sec',results[i].time);

		        	//jQuery Binds for the search
		        	$(sBodyInnerContainer).hover(
		        		function(){ 
		        			//$(this).addClass('hover');
		        			$(this).css('background-color','#faa166');	           		
		        		},
		        		function(){ 
		        			//$(this).removeClass('hover');
		        			$(this).removeAttr('style');
		        		}
		        	);

		        	$(sBodyInnerContainer).click(function(){ 
		        		var sec = $(this).attr("sec");
		        		paella.player.videoContainer.seekToTime(sec);
		        	});
				}
			}
		}
	    });
	},

	buildContent:function(domElement) {
		var thisClass = this;
		var myUrl = null;

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
	        	thisClass.doSearch(text, searchBody);
			});

        domElement.appendChild(searchPluginContainer);

    },

});

paella.plugins.searchPlugin = new paella.plugins.SearchPlugin();