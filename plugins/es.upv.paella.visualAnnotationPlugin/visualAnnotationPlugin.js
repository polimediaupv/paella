/**
 * Created by leosamu on 24/9/15.
 */

paella.dataDelegates.VisualAnnotationsDataDelegate = Class.create(paella.DataDelegate,{
   read: function(context, params, onSuccess) {
	   
   //params need videoid to get annotations from a video
   /*console.log("pàtata");
   data = [{"_id":"e28e0130-9824-11e5-88b4-a94245a618bnd","video":"7a85bac5-fcdf-4989-8e98-6166bef80bea","user":"3818f61e-b2c4-425c-bff7-b778cb2f9966","type":"BANNER","time":6,"duration":4,"content":"{\"data\":{\"en\":\"<p>Sometimes you will need more space than just a little Ad, to write what you want to write.</p><p>Or simply a bigger banner to include logos and publicity.</p>\"},        \"pauser\":false,             \"profile\":\"\", \"style\":\"#e28e0130-9824-11e5-88b4-a94245a618bnd {color:rgba(255,255,255,1);background-color: rgba(0,0,0,0.6);text-align: justify;-moz-border-radius: 15px;border-radius: 15px;line-height: 3vmin;font-size: 1.2vw;padding: 1vw;position: absolute;bottom:70px;left:30px;right:30px;} #e28e0130-9824-11e5-88b4-a94245a618ad0:hover { background-color: rgba(0,0,0,0.8);} #e28e0130-9824-11e5-88b4-a94245a618bnd a{color: rgb(255, 230, 45);} #e28e0130-9824-11e5-88b4-a94245a618bnd a:visited{color: rgba(255, 255, 150, 0.80);}\"}","__v":0},{"_id":"e28e0130-9824-11e5-88b4-a94245a618ful","video":"7a85bac5-fcdf-4989-8e98-6166bef80bea","user":"3818f61e-b2c4-425c-bff7-b778cb2f9966","type":"FULL","time":38,"duration":10,"content":"{\"data\":{\"en\":\"<iframe src=https://docs.google.com/document/d/1T5teHSw-UlhZFVhx1wXTGZ10ZaX_AOkNglauFY_-E2U/edit?usp=sharing class=annotationiframe frameborder=0></iframe>\"},        \"pauser\":true,             \"profile\":\"slide_over_professor\", \"style\":\"#e28e0130-9824-11e5-88b4-a94245a618ful {color:rgba(255,255,255,1);background-color: rgba(0,0,0,0.6);text-align: justify;-moz-border-radius: 15px;border-radius: 15px;line-height: 3vmin;font-size: 1.2vw;padding: 1vw;position: absolute;bottom:40px;top:20px;left:30px;right:30px;} #e28e0130-9824-11e5-88b4-a94245a618ful:hover { background-color: rgba(0,0,0,0.8);} #e28e0130-9824-11e5-88b4-a94245a618ful a{color: rgb(255, 230, 45);} #e28e0130-9824-11e5-88b4-a94245a618ful a:visited{color: rgba(255, 255, 150, 0.80);}\"}","__v":0},{"_id":"e28e0130-9824-11e5-88b4-a94245a618ad0","video":"7a85bac5-fcdf-4989-8e98-6166bef80bea","user":"3818f61e-b2c4-425c-bff7-b778cb2f9966","type":"AD","time":0,"duration":5,"content":"{\"data\":{\"es\":\"Visita nuestros cursos en UPV[X]<BR><a href=http://upvx.es/ target=_blank>UPV[X]</a>\",                    \"en\":\"Visit our courses at UPV[X]<a href=http://upvx.es/ target=_blank>UPV[X]</a>\"},             \"pauser\":false,             \"profile\":\"\",             \"format\":{\"left\":40, \"top\":585, \"width\":430, \"height\":80},\"style\":\"#e28e0130-9824-11e5-88b4-a94245a618ad0 .AdtextAnnotationLink {  left: 0;  top: 0;  position: absolute;  z-index: 1;  width: 18%;  height: 100%;  background-color: black;} #e28e0130-9824-11e5-88b4-a94245a618ad0 .AdtextAnnotationIMG{ position: relative;    left: 33%;    top: 33%;    width: 30%;    height: 30%; } #e28e0130-9824-11e5-88b4-a94245a618ad0 .AdtextAnnotationBody{    padding-left: 20%;    top: 30%;    position: absolute; } #e28e0130-9824-11e5-88b4-a94245a618ad0 {color:rgba(255,255,255,1);background-color: rgba(0,0,0,0.6);text-align: justify;-moz-border-radius: 15px;border-radius: 15px;line-height: 3vmin;font-size: 1.2vw;padding: 1vw;position: absolute;bottom:70px;left:30px;width:33%;height:16%;} #e28e0130-9824-11e5-88b4-a94245a618ad0:hover { background-color: rgba(0,0,0,0.8);} #e28e0130-9824-11e5-88b4-a94245a618ad0 a{color: rgb(255, 230, 45);} .ADtextAnnotation a:visited{color: rgba(255, 255, 150, 0.80);}\"}","__v":0},{"_id":"e28e0130-9824-11e5-88b4-a94245a618ban","video":"7a85bac5-fcdf-4989-8e98-6166bef80bea","user":"3818f61e-b2c4-425c-bff7-b778cb2f9966","type":"NOTE","time":12,"duration":9,"content":"{\"data\":{\"en\":\"<h3>Sometimes, we could like to add new content to our videos.</h3> <p>Even better show that new stuff instead of the default slides, just adding an annotation.</p><p><img src=http://t00.deviantart.net/c99uKXgboMR4J4tJaDsY7WMmQB8=/300x200/filters:fixed_height(100,100):origin()/pre08/03f4/th/pre/i/2010/143/6/2/swirl2_by_jsp7707.jpg></p>\"},             \"pauser\":false,             \"profile\":\"professor\",              \"style\":\"#e28e0130-9824-11e5-88b4-a94245a618ban {color:rgba(255,255,255,1);background-color: rgba(0,0,0,0.6);text-align: justify;-moz-border-radius: 15px;border-radius: 15px;line-height: 3vmin;font-size: 1.2vw;padding: 1vw;position: absolute;bottom:70px;left:30px;width:40%;} #e28e0130-9824-11e5-88b4-a94245a618ban:hover { background-color: rgba(0,0,0,0.8);} #e28e0130-9824-11e5-88b4-a94245a618ban a{color: rgb(255, 230, 45);} #e28e0130-9824-11e5-88b4-a94245a618ban a:visited{color: rgba(255, 255, 150, 0.80);}\"}","__v":0},{"_id":"e28e0130-9824-11e5-88b4-a94245a618pro","video":"7a85bac5-fcdf-4989-8e98-6166bef80bea","user":"3818f61e-b2c4-425c-bff7-b778cb2f9966","type":"MEMO","time":23,"duration":9,"content":"{\"data\":{\"en\":\"<h3>If we make the math, the result for both X and Y will be:</h3> <form action= > <input type=radio name=vehicle value=00>X = 0 & Y = 0<br> <input type=radio name=vehicle value=01>X = 0 & Y = 1<br> <input type=radio name=vehicle value=10>X = 1 & Y = 0<br> <input type=radio name=vehicle value=11>X = 1 & Y = 1<br> <input type=button class=bttn value=send onclick=self.closeAnnotation(element,true);> </form> <hr><p>Creating problems that coexists with the video is totally factible, and we could link this problems from/to another platforms.</p>\"}, \"pauser\":true,             \"profile\":\"problem\", \"style\":\"#e28e0130-9824-11e5-88b4-a94245a618pro {color:rgb(0,0,0);background-color: rgba(247,247,247,0.30);border-style:dashed;border-color: rgba(100,100,100,0.8);text-align: justify;-moz-border-radius: 15px;border-radius: 15px;line-height: 3vmin;font-size: 1.2vw;padding: 1vw;position: absolute;bottom:10px;top:10px;left:30px;width:50%;} #e28e0130-9824-11e5-88b4-a94245a618pro:hover { background-color: rgba(0,0,0,0.8);} #e28e0130-9824-11e5-88b4-a94245a618pro a{color: rgb(255, 230, 45);} #e28e0130-9824-11e5-88b4-a94245a618pro a:visited{color: rgba(255, 255, 150, 0.80);}\"           }","__v":0}];
              if (typeof(onSuccess)=='function') { onSuccess(data, true); }*/
    //params.id 
       $.getJSON(params.url + "7a85bac5-fcdf-4989-8e98-6166bef80bea" + "/annotations",function(data){
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
	        
            self._annotations = data;
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
    	self._annotations.some(function(element, index, array){
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
	              paella.player.pause().then(function(){self._paused=element._id;});
		        }else
                {
	            	self._paused=null;
                    self.closeAnnotation(element,false);
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