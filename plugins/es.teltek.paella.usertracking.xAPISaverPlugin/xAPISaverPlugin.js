new (Class (paella.userTracking.SaverPlugIn, {
	type:'userTrackingSaverPlugIn',
	endpoint:"",
	auth:"",
	paused:true,
	played_segments:"",
	played_segments_segment_start:null,
	played_segments_segment_end:null,
	progress:null,
	duration:null,
	current_time:[],
	completed:false,
	volume:null,
	speed:null,
	quality:null,
	fullscreen:false,
	title:"",
	user_agent:"",
	total_time:0,
	total_time_start:0,
	total_time_end:0,

	getName: function() {return "es.teltek.paella.usertracking.xAPISaverPlugin";},

	setup:function(){
		var self = this
		this._loadDeps().then(function (){
			var conf = {
				"endpoint" : self.endpoint,
				"auth" : self.auth
			};
			ADL.XAPIWrapper.changeConfig(conf);
			//TODO get cookie to use in registration and session_id
			ADL.XAPIWrapper.lrs.registration = ADL.ruuid()

			//TODO: Get session data from LRS
			// var myparams = ADL.XAPIWrapper.searchParams();
			// var actor = new ADL.XAPIStatement.Agent("mailto:peite@example.com", "Peite");
			// myparams['activity'] = "http://example.com/test_video";
			// myparams['verb'] = 'https://w3id.org/xapi/video/verbs/paused';
			// myparams['limit']	= 1;

			var ret = ADL.XAPIWrapper.getStatements(myparams);
			console.log(ret)
		})
		paella.events.bind(paella.events.timeUpdate, function(event,params){
			self.current_time.push(params.currentTime)
			self.progress = self.get_progress(params.currentTime, params.duration)
			if (self.progress == 1 && self.completed == false){
				self.completed = true
				self.end_played_segment(params.currentTime)
				self.send_completed(params.currentTime, self.progress)
			}
		})
	},
	checkEnabled: function(onSuccess) {
		this._url = this.config.url;
		this._index = this.config.index || "paellaplayer";
		this._type = this.config.type || "usertracking";
		this.endpoint = this.config.endpoint;
		this.auth = this.config.auth;
		var enabled = true;
		onSuccess(enabled);
	},
	_loadDeps:function() {
		return new Promise((resolve,reject) => {
			if (!window.$paella_mpd) {
				require(['resources/deps/xapiwrapper.min.js'],function() {
					window.$paella_bg2e = true;
					resolve(window.$paella_bg2e);
				});
			}
			else {
				defer.resolve(window.$paella_mpd);
			}
		});
	},

	log: function(event, params) {
		var p = params;
		var self = this
		// console.log(event)
		// console.log(params)
		switch (event) {
			// Retrieve initial parameters from player
			case "paella:loadComplete":
			this.user_agent = navigator.userAgent.toString();
			this.title = paella.player.videoLoader.getMetadata().title
			paella.player.videoContainer.duration().then(function(duration) {
				return paella.player.videoContainer.mainAudioPlayer().volume().then(function(volume) {
					return paella.player.videoContainer.getCurrentQuality().then(function(quality) {
						self.duration = duration
						self.volume = volume
						self.speed = 1
						self.quality = quality.shortLabel()
						self.send_initialized()
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
				self.send_interacted(current_time)

			});
			break;
			case "paella:setplaybackrate":
			paella.player.videoContainer.currentTime()
			.then(function(currentTime) {
				var current_time = self.format_float(currentTime)
				self.speed = params.rate
				self.send_interacted(current_time)
			})
			break;
			case "paella:qualityChanged":
			paella.player.videoContainer.currentTime().then(function(currentTime) {
				return paella.player.videoContainer.getCurrentQuality().then(function(quality) {
					self.quality = quality.shortLabel()
					var current_time = self.format_float(currentTime)
					self.send_interacted(current_time)
				})
			})
			break;
			case "paella:enterFullscreen":
			case "paella:exitFullscreen":
			paella.player.videoContainer.currentTime().then(function(currentTime) {
				var current_time = self.format_float(currentTime)
				self.fullscreen ? self.fullscreen = false : self.fullscreen = true
				self.send_interacted(current_time)
			})
			break;
			default:
		}
	},
	send: function(params){
		//TODO Get the user from LMS
		var agent = new ADL.XAPIStatement.Agent("mailto:peite@example.com", "Peite")
		var verb = new ADL.XAPIStatement.Verb(params.verb.id, params.verb.description)
		//TODO Get the correct URL to the activity
		var activity = new ADL.XAPIStatement.Activity("http://example.com/" + this.title.replace(/\s+/g, ''), this.title, "Video demo")
		activity.definition.type = "https://w3id.org/xapi/video/activity-type/video"
		paella.player.videoContainer.mainAudioPlayer().volume().then(function(volume){})
		var statement = new ADL.XAPIStatement(agent, verb, activity)
		statement.result = params.result
		//TODO: Obtain language
		statement.context = {
			"language": "es-ES",
			"extensions":{
				"https://w3id.org/xapi/video/extensions/length": Math.floor(this.duration),
				"https://w3id.org/xapi/video/extensions/volume": this.format_float(this.volume),
				"https://w3id.org/xapi/video/extensions/speed": this.speed + "x",
				"https://w3id.org/xapi/video/extensions/quality": this.quality,
				"https://w3id.org/xapi/video/extensions/full-screen": this.fullscreen,
				"https://w3id.org/xapi/video/extensions/user-agent": this.user_agent
			}
		}
		statement.generateRegistration()

		// Dispatch the statement to the LRS
		var result = ADL.XAPIWrapper.sendStatement(statement);
	},
	send_initialized: function() {
		var statement = {
			"verb":{
				"id":"http://adlnet.gov/expapi/verbs/initialized",
				"description":"initalized"
			},
		}
		this.send(statement)
	},
	send_terminated: function(self) {
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
	},
	send_play: function(self){
		this.paused = false
		this.total_time_start = new Date().getTime() / 1000;
		paella.player.videoContainer.currentTime()
		.then(function(currentTime) {
			var start_time = self.format_float(currentTime)
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
	},
	send_pause: function(self){
		this.paused = true
		this.total_time_end = new Date().getTime() / 1000;
		this.total_time += (this.total_time_end - this.total_time_start)
		paella.player.videoContainer.currentTime().then(function(currentTime) {
			//return paella.player.videoContainer.duration().then(function(duration) {
			var end_time = self.format_float(currentTime)
			//self.progress = self.get_progress(end_time, duration)
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
	},
	send_seek: function(self, params){
		var seekedto = this.format_float(params.newPosition)
		//FIXME Metodo para obtener el instante desde donde empieza el seek
		var a = this.current_time.filter(function(value){
			return value <= seekedto -1
		})
		if (a.length == 0){
			a = this.current_time.filter(function(value){
				return value >= seekedto + 1
			})
		}
		var seekedfrom = a.pop()
		this.current_time = []
		this.current_time.push(seekedto)
		// Fin de FIXME
		this.end_played_segment(seekedfrom)
		this.start_played_segment(seekedto)
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
	},
	send_completed: function(time, progress){
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
	},
	send_interacted: function(current_time){
		var statement = {
			"verb":{
				"id":"http://adlnet.gov/expapi/verbs/interacted",
				"description":"interacted"
			},
			"result" : {
				"extensions":{
					"https://w3id.org/xapi/video/extensions/time" : current_time
				}
			}
		}
		this.send(statement)
	},
	start_played_segment: function (start_time){
		this.played_segments_segment_start = start_time;
	},
	end_played_segment: function(end_time){
		var arr;
		arr = (this.played_segments == "")? []:this.played_segments.split("[,]");
		arr.push(this.played_segments_segment_start + "[.]" + end_time);
		this.played_segments = arr.join("[,]");
		this.played_segments_segment_end = end_time;
		this.played_segments_segment_start = null;
	},
	format_float: function(number){
		number = parseFloat(number) //Ensure that number is a float
		return parseFloat(number.toFixed(3))
	},
	get_progress: function(currentTime, duration){
		var arr, arr2;

		//get played segments array
		arr = (this.played_segments == "")? []:this.played_segments.split("[,]");
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
	// return 1
}
}));
