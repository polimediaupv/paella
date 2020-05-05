paella.addPlugin(function() {
  return class xAPISaverPlugin extends paella.userTracking.SaverPlugIn {
    getName() {return "es.teltek.paella.usertracking.xAPISaverPlugin";}

    setup(){
      this.endpoint = this.config.endpoint;
      this.auth = this.config.auth;
      this.user_info = {}
      this.paused = true
      this.played_segments = ""
      this.played_segments_segment_start = null
      this.played_segments_segment_end = null
      this.progress = 0
      this.duration = 0
      this.current_time = []
      this.completed = false
      this.volume = null
      this.speed = null
      this.language = "us-US"
      this.quality = null
      this.fullscreen = false
      this.title = "No title available"
      this.description = ""
      this.user_agent = ""
      this.total_time = 0
      this.total_time_start = 0
      this.total_time_end = 0
      this.session_id = ""

      let self = this
      this._loadDeps().then(function (){
        let conf = {
          "endpoint" : self.endpoint,
          "auth" : "Basic " + toBase64(self.auth)
        };
        ADL.XAPIWrapper.changeConfig(conf);
      })
      paella.events.bind(paella.events.timeUpdate, function(event,params){
        self.current_time.push(params.currentTime)
        if (self.current_time.length >=10){
          self.current_time = self.current_time.slice(-10)
        }

        var a = Math.round(self.current_time[0])
        var b = Math.round(self.current_time[9])

        if ((params.currentTime !== 0)  && (a + 1 >= b) && (b - 1 >= a)){
          self.progress = self.get_progress(params.currentTime, params.duration)
          if (self.progress >= 0.95 && self.completed === false){
            self.completed = true
            self.end_played_segment(params.currentTime)
            self.start_played_segment(params.currentTime)
            self.send_completed(params.currentTime, self.progress)
          }
        }
      })
    }

    get_session_data(){
      var myparams = ADL.XAPIWrapper.searchParams();
      var agent = JSON.stringify({"mbox" : this.user_info.email})
      var timestamp = new Date()
      timestamp.setDate(timestamp.getDate() - 1);
      timestamp = timestamp.toISOString()
      myparams['activity'] = window.location.href;
      myparams['verb'] = 'http://adlnet.gov/expapi/verbs/terminated';
      myparams['since'] = timestamp
      myparams['limit']	= 1;
      myparams['agent'] = agent
      var ret = ADL.XAPIWrapper.getStatements(myparams);
      if (ret.statements.length === 1){
        this.played_segments = ret.statements[0].result.extensions['https://w3id.org/xapi/video/extensions/played-segments']
        this.progress = ret.statements[0].result.extensions['https://w3id.org/xapi/video/extensions/progress']
        ADL.XAPIWrapper.lrs.registration = ret.statements[0].context.registration
      }
      else{
        ADL.XAPIWrapper.lrs.registration = ADL.ruuid()
      }
    }

    getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }

    setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    checkCookie(){
      var user_info = this.getCookie("user_info");
      if (user_info === "") {
        user_info = JSON.stringify(generateName())
      }
      this.setCookie("user_info", user_info);
      return JSON.parse(user_info)
    }

    checkEnabled(onSuccess) {
      this._url = this.config.url;
      this._index = this.config.index || "paellaplayer";
      this._type = this.config.type || "usertracking";

      onSuccess(true);
    }

    _loadDeps() {
      return new Promise((resolve,reject) => {
        paella.require('resources/deps/xapiwrapper.min.js')
          .then(() => {
            return paella.require('resources/deps/random_name_generator.js')
          })
          .then(() => {
            resolve();
          });
      });
    }

    log(event, params) {
      var p = params;
      let self = this
      // console.log(event)
      // console.log(params)
      switch (event) {
        //Retrieve initial parameters from player
        case "paella:loadComplete":
        this.user_agent = navigator.userAgent.toString();
        this.get_title()
        this.get_description()
        paella.player.videoContainer.duration().then(function(duration) {
          return paella.player.videoContainer.streamProvider.mainAudioPlayer.volume()
          .then(function(volume) {
            return paella.player.videoContainer.getCurrentQuality().then(function(quality) {
              return paella.player.auth.userData().then(function (user_info){
                self.duration = duration
                self.volume = volume
                self.speed = 1
                if (paella.player.videoContainer.streamProvider.mainAudioPlayer.stream.language){
                  self.language = paella.player.videoContainer.streamProvider.mainAudioPlayer.stream.language.replace("_","-")
                }
                self.quality = quality.shortLabel()

                if (user_info.email && user_info.name){
                  self.user_info = user_info
                }
                else{
                  self.user_info = self.checkCookie()
                }

                self.get_session_data()

                self.send_initialized()
              });
            });
          });
        });
        window.onbeforeunload = function(e) {
          if (!self.paused){
            self.send_pause(self)
          }
          //TODO Algunas veces se envia terminated antes que paused
          self.send_terminated(self)
          // var dialogText = 'Dialog text here';
          // e.returnValue = dialogText;
          // window.onbeforeunload = null;
          // return dialogText;
        };
        break;
        case "paella:play":
        this.send_play(self)
        break;
        case "paella:pause":
        this.send_pause(self)
        break;
        case "paella:seektotime":
        this.send_seek(self, params)
        break;
        //Player options
        case "paella:setVolume":
        paella.player.videoContainer.currentTime()
        .then(function(currentTime) {
          var current_time = self.format_float(currentTime)
          self.volume = params.master
          //self.send_interacted(current_time, {"https://w3id.org/xapi/video/extensions/volume": params.master})
          var interacted = {"https://w3id.org/xapi/video/extensions/volume": self.format_float(params.master)}
          self.send_interacted(current_time, interacted)

        });
        break;
        case "paella:setplaybackrate":
        paella.player.videoContainer.currentTime()
        .then(function(currentTime) {
          var current_time = self.format_float(currentTime)
          self.speed = params.rate
          var interacted = {"https://w3id.org/xapi/video/extensions/speed": params.rate + "x"}
          self.send_interacted(current_time, interacted)
        })
        break;
        case "paella:qualityChanged":
        paella.player.videoContainer.currentTime().then(function(currentTime) {
          return paella.player.videoContainer.getCurrentQuality().then(function(quality) {
            self.quality = quality.shortLabel()
            var current_time = self.format_float(currentTime)
            var interacted = {"https://w3id.org/xapi/video/extensions/quality": quality.shortLabel()}
            self.send_interacted(current_time, interacted)
          })
        })
        break;
        case "paella:enterFullscreen":
        case "paella:exitFullscreen":
        paella.player.videoContainer.currentTime().then(function(currentTime) {
          var current_time = self.format_float(currentTime)
          self.fullscreen ? self.fullscreen = false : self.fullscreen = true
          var interacted = {"https://w3id.org/xapi/video/extensions/full-screen": self.fullscreen}
          self.send_interacted(current_time, interacted)
        })
        break;
        default:
        break;
      }
    }

    send(params){
      var agent = new ADL.XAPIStatement.Agent(this.user_info.email, this.user_info.name)
      var verb = new ADL.XAPIStatement.Verb(params.verb.id, params.verb.description)
      var activity = new ADL.XAPIStatement.Activity(window.location.href, this.title, this.description)
      activity.definition.type = "https://w3id.org/xapi/video/activity-type/video"
      paella.player.videoContainer.streamProvider.mainAudioPlayer.volume().then(function(volume){})
      var statement = new ADL.XAPIStatement(agent, verb, activity)
      statement.result = params.result
      if (params.verb.id === "http://adlnet.gov/expapi/verbs/initialized"){
        statement.generateId()
        this.session_id = statement.id
      }


      var ce_base = {
        "https://w3id.org/xapi/video/extensions/session-id": this.session_id,
        "https://w3id.org/xapi/video/extensions/length": Math.floor(this.duration),
        "https://w3id.org/xapi/video/extensions/user-agent": this.user_agent
      }
      var ce_interactions = {
        "https://w3id.org/xapi/video/extensions/volume": this.format_float(this.volume),
        "https://w3id.org/xapi/video/extensions/speed": this.speed + "x",
        "https://w3id.org/xapi/video/extensions/quality": this.quality,
        "https://w3id.org/xapi/video/extensions/full-screen": this.fullscreen
      }
      var context_extensions = {}
      if (params.interacted){
        context_extensions = $.extend({}, ce_base, params.interacted)
      }
      else{
        context_extensions = $.extend({}, ce_base, ce_interactions)
      }

      statement.context = {
        "language": this.language,
        "extensions": context_extensions,
        "contextActivities":{
          "category":[{
            "objectType":"Activity",
            "id":"https://w3id.org/xapi/video"
          }]
        }
      }

      // Dispatch the statement to the LRS
      var result = ADL.XAPIWrapper.sendStatement(statement);
    }

    send_initialized() {
      var statement = {
        "verb":{
          "id":"http://adlnet.gov/expapi/verbs/initialized",
          "description":"initalized"
        },
      }
      this.send(statement)
    }

    send_terminated(self) {
      paella.player.videoContainer.currentTime()
      .then(function(end_time) {
        var statement = {
          "verb":{
            "id":"http://adlnet.gov/expapi/verbs/terminated",
            "description":"terminated"
          },
          "result" : {
            "extensions":{
              "https://w3id.org/xapi/video/extensions/time" : end_time,
              "https://w3id.org/xapi/video/extensions/progress": self.progress,
              "https://w3id.org/xapi/video/extensions/played-segments": self.played_segments
            }
          }
        }
        self.send(statement)
      })
    }

    send_play(self){
      this.paused = false
      this.total_time_start = new Date().getTime() / 1000;
      paella.player.videoContainer.currentTime()
      .then(function(currentTime) {
        var start_time = self.format_float(currentTime)
        //When the video starts we force start_time to 0
        if (start_time <= 1){
          start_time = 0
        }
        self.start_played_segment(start_time)
        var statement = {
          "verb":{
            "id":"https://w3id.org/xapi/video/verbs/played",
            "description":"played"
          },
          "result" : {
            "extensions":{
              "https://w3id.org/xapi/video/extensions/time" : start_time
            }
          }
        }
        self.send(statement)
      });
    }

    send_pause(self){
      this.paused = true
      this.total_time_end = new Date().getTime() / 1000;
      this.total_time += (this.total_time_end - this.total_time_start)
      paella.player.videoContainer.currentTime().then(function(currentTime) {
        //return paella.player.videoContainer.duration().then(function(duration) {
        var end_time = self.format_float(currentTime)
        //self.progress = self.get_progress(end_time, duration)
        //If a video end, the player go to the video start and raise a pause event with currentTime = 0
        if (end_time === 0){
          end_time = self.duration
        }
        self.end_played_segment(end_time)
        var statement = {
          "verb":{
            "id":"https://w3id.org/xapi/video/verbs/paused",
            "description":"paused"
          },
          "result" : {
            "extensions":{
              "https://w3id.org/xapi/video/extensions/time" : end_time,
              "https://w3id.org/xapi/video/extensions/progress": self.progress,
              "https://w3id.org/xapi/video/extensions/played-segments": self.played_segments
            }
          }
        }
        self.send(statement)
      });
      //});
    }

    send_seek(self, params){
      var seekedto = this.format_float(params.newPosition)
      //FIXME Metodo para obtener el instante desde donde empieza el seek
      var a = this.current_time.filter(function(value){
        return value <= seekedto -1
      })
      if (a.length === 0){
        a = this.current_time.filter(function(value){
          return value >= seekedto + 1
        })
      }
      //In some cases, when you seek to the end of the video the array contains zeros at the end
      var seekedfrom = a.filter(Number).pop()
      this.current_time = []
      this.current_time.push(seekedto)
      // Fin de FIXME
      //If the video is paused it's not neccesary create a new segment, because the pause event already close a segment
      self.progress = self.get_progress(seekedfrom, self.duration)
      if (!this.paused){
        this.end_played_segment(seekedfrom)
        this.start_played_segment(seekedto)
      }
      //paella.player.videoContainer.duration().then(function(duration) {
      //var progress = self.get_progress(seekedfrom, duration)

      var statement = {
        "verb":{
          "id":"https://w3id.org/xapi/video/verbs/seeked",
          "description":"seeked"
        },
        "result" : {
          "extensions":{
            "https://w3id.org/xapi/video/extensions/time-from" : seekedfrom,
            "https://w3id.org/xapi/video/extensions/time-to": seekedto,
            // Aqui tambien deberiamos de enviar los segmentos reproducidos y el porcentaje
            "https://w3id.org/xapi/video/extensions/progress": self.progress,
            "https://w3id.org/xapi/video/extensions/played-segments": self.played_segments
          }
        }
      }
      self.send(statement)
      //})
    }

    send_completed(time, progress){
      var statement = {
        "verb":{
          "id":"http://adlnet.gov/xapi/verbs/completed",
          "description":"completed"
        },
        "result" : {
          "completion": true,
          "success": true,
          "duration": "PT" + this.total_time +"S",
          "extensions":{
            "https://w3id.org/xapi/video/extensions/time" : time,
            "https://w3id.org/xapi/video/extensions/progress" : progress,
            "https://w3id.org/xapi/video/extensions/played-segments": this.played_segments
          }
        }
      }
      this.send(statement)
    }

    send_interacted(current_time, interacted){
      var statement = {
        "verb":{
          "id":"http://adlnet.gov/expapi/verbs/interacted",
          "description":"interacted"
        },
        "result" : {
          "extensions":{
            "https://w3id.org/xapi/video/extensions/time" : current_time
          }
        },
        "interacted" : interacted
      }
      this.send(statement)
    }

    start_played_segment(start_time){
      this.played_segments_segment_start = start_time;
    }

    end_played_segment(end_time){
      var arr;
      arr = (this.played_segments === "")? []:this.played_segments.split("[,]");
      arr.push(this.played_segments_segment_start + "[.]" + end_time);
      this.played_segments = arr.join("[,]");
      this.played_segments_segment_end = end_time;
      //this.played_segments_segment_start = null;
    }

    format_float(number){
      number = parseFloat(number) //Ensure that number is a float
      return parseFloat(number.toFixed(3))
    }

    get_title(){
      if (paella.player.videoLoader.getMetadata().i18nTitle){
        this.title = paella.player.videoLoader.getMetadata().i18nTitle
      }
      else if (paella.player.videoLoader.getMetadata().title){
        this.title = paella.player.videoLoader.getMetadata().title
      }
    }

    get_description(){
      if (paella.player.videoLoader.getMetadata().i18nTitle){
        this.description = paella.player.videoLoader.getMetadata().i18nDescription
      }
      else {
        this.description = paella.player.videoLoader.getMetadata().description
      }
    }

    get_progress(currentTime, duration){
      var arr, arr2;

      //get played segments array
      arr = (this.played_segments === "")? []:this.played_segments.split("[,]");
      if(this.played_segments_segment_start != null){
        arr.push(this.played_segments_segment_start + "[.]" + currentTime);
      }

      arr2 = [];
      arr.forEach(function(v,i) {
        arr2[i] = v.split("[.]");
        arr2[i][0] *= 1;
        arr2[i][1] *= 1;
      });

      //sort the array
      arr2.sort(function(a,b) { return a[0] - b[0];});

      //normalize the segments
      arr2.forEach(function(v,i) {
        if(i > 0) {
          if(arr2[i][0] < arr2[i-1][1]) { 	//overlapping segments: this segment's starting point is less than last segment's end point.
          //console.log(arr2[i][0] + " < " + arr2[i-1][1] + " : " + arr2[i][0] +" = " +arr2[i-1][1] );
          arr2[i][0] = arr2[i-1][1];
          if(arr2[i][0] > arr2[i][1])
          arr2[i][1] = arr2[i][0];
        }
      }
    });

    //calculate progress_length
    var progress_length = 0;
    arr2.forEach(function(v,i) {
      if(v[1] > v[0])
      progress_length += v[1] - v[0];
    });

    var progress = 1 * (progress_length / duration).toFixed(2);
    return progress;
  }
}});
