/**
 * Created by leosamu on 24/9/15.
 */

paella.dataDelegates.VisualAnnotationsDataDelegate = Class.create(paella.DataDelegate,{
   read: function(context, params, onSuccess) {
    // 
       $.getJSON(params.url + params.id + "/annotations",function(data){
           if (typeof(onSuccess)=='function') { onSuccess(data, true); }
       });


   }
});


Class ("paella.plugins.visualAnnotationPlugin", paella.EventDrivenPlugin,{
	//_url:this.config.url,
	_annotations:null, //will store the annotations
    _paused:null,
    _rootElement:null,
    _prevProfile:null,//we store the profile we had before opening the annotation
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	getName:function() {
		return "es.upv.paella.visualAnnotationPlugin";
	},

	getEvents:function() {
		return[
			paella.events.timeUpdate
		];
    },

    setup:function(){
    	var self = this;
        paella.data.read('visualAnnotations',{id:paella.initDelegate.getId(),url:self.config.url},function(data,status) {
			self._annotations = Array.isArray(data) ? data:[];
        });
        self._prevProfile=null;
    },

    onEvent:function(event, params){
    	var self = this;
    	switch(event){
    		case paella.events.timeUpdate:
                this.drawAnnotation(event,params);
                break;
    	}
    },

    drawAnnotation:function(event,params){
    	var self = this;
    	var p = {};
    	//var annotation = {};
    	p.closeButton=true;
    	p.onClose = function(){
    		paella.events.trigger(paella.events.play);
    	};
    	if (self._annotations) self._annotations.some(function(element, index, array){
            currentTime = Math.round(params.currentTime);
			var annotation = JSON.parse(element.content);
			//if we are on time and the annotation does not exist
    		if(currentTime >= element.time && currentTime < element.time+element.duration && $("#" + element._id).length==0){
	    		//var annotation = JSON.parse(element.content);
                //create a layer for each type of videoanotation
                var layer = paella.player.videoContainer.overlayContainer.getLayer(element.type);
                var rect = annotation.format;
                //we clear the container before inserting new elements
                //overlayContainer.removeElement(self._rootElement);
                self._rootElement = document.createElement("div");
                self._rootElement.className = element.type + 'textAnnotation';
                self._rootElement.id=element._id;

                var button = document.createElement("div");
                button.className ="annotationClose righttop";
                button.innerHTML = "X";
                button.onclick = function(){
                    $('#' + element._id).css({ display: "none" });
                };

                var el = document.createElement("div");
                el.className = 'innerAnnotation';
                for (var firstKey in annotation.data) break;
                if (element.type=="AD") {
                    el.innerHTML = '<div class="AdtextAnnotationLink" ><img src="./resources/images/popup.png" class="AdtextAnnotationIMG"></div>  <div class="AdtextAnnotationBody">' +  annotation.data[navigator.language || navigator.userLanguage]||annotation.data[firstKey] + '</div></div>';
                }
                else
                {	                
                    el.innerHTML = annotation.data[navigator.language || navigator.userLanguage]||annotation.data[firstKey];
                }

                if (annotation.profile!=""){
                    //we need to store and recover the profile
                    if (self._prevProfile == null){
                        self._prevProfile = paella.plugins.viewModePlugin.active_profiles||paella.Profiles.getDefaultProfile();
                    }
                    paella.events.trigger(paella.events.setProfile,{profileName:annotation.profile});
                }
                el.appendChild(button);
                //let create the style
                var sheet = document.createElement('style');
                sheet.innerHTML=annotation.style;
                el.appendChild(sheet);
                
                self._rootElement.appendChild(el);
				
                //overlayContainer.addElement(self._rootElement, rect);
                layer.appendChild(self._rootElement);
	    		return true;
    		}
            //we close annotations when annotation time is gone.
            if ((currentTime < element.time || currentTime > element.time + element.duration) && $("#" + element._id).length!=0){
	            //var annotation = JSON.parse(element.content);
	            
                if (annotation.pauser==true && self._paused!=element._id)
                { 
	              self._paused=element._id;
                  paella.player.pause();
	         	}else
                {
	                var paused = true;
	                paella.player.paused().then(function(p){ paused=p; });
	                if (!paused){
		               self._paused=null;
					   self.closeAnnotation(element,false); 
	                }
	            	
                }
                return true;
            }
    	});

    },

    closeAnnotation:function(element, forced){
        //if (forced) this._closedIds.push(element._id);
        paella.events.trigger(paella.events.setProfile,{profileName:this._prevProfile});
        this._prevProfile=null;
        $('#'+element._id).remove();
    }
});
new paella.plugins.visualAnnotationPlugin();