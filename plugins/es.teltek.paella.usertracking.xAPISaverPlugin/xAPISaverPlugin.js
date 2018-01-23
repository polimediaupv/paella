paella.addPlugin(function() {
	return class xAPISaverPlugin extends paella.userTracking.SaverPlugIn {

		getName() {return "es.teltek.paella.usertracking.xAPISaverPlugin";}

		setup(){
			this.endpoint = this.config.endpoint;
			this.auth = this.config.auth;
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
			this.quality = null
			this.fullscreen = false
			this.title = ""
			this.description = ""
			this.user_agent = ""
			this.total_time = 0
			this.total_time_start = 0
			this.total_time_end = 0

			let self = this
			this._loadDeps().then(function (){
				let conf = {
					"endpoint" : self.endpoint,
					"auth" : self.auth
				};
				ADL.XAPIWrapper.changeConfig(conf);
				//TODO get cookie to use in registration and session_id
				ADL.XAPIWrapper.lrs.registration = ADL.ruuid()

				//TODO: Get session data from LRS
				// var myparams = ADL.XAPIWrapper.searchParams();
				// var actor = new ADL.XAPIStatement.Agent("mailto:annonymous@example.com", "Annonymous");
				// myparams['activity'] = "http://example.com/test_video";
				// myparams['verb'] = 'https://w3id.org/xapi/video/verbs/paused';
				// myparams['limit']	= 1;
				// var ret = ADL.XAPIWrapper.getStatements(myparams);
				// console.log(ret)

			})
			paella.events.bind(paella.events.timeUpdate, function(event,params){
				self.current_time.push(params.currentTime)
				if (self.current_time.length >=10){
					self.current_time = self.current_time.slice(-10)
				}

				let a = Math.round(self.current_time[0])
				let b = Math.round(self.current_time[9])

				if ((params.currentTime !== 0)  && (a + 1 >= b) && (b - 1 >= a)){
					self.progress = self.get_progress(params.currentTime, params.duration)
					if (self.progress === 1 && self.completed === false){
						self.completed = true
						self.end_played_segment(params.currentTime)
						self.start_played_segment(params.currentTime)
						self.send_completed(params.currentTime, self.progress)
					}
				}
			})
		}

		checkEnabled(onSuccess) {
			this._url = this.config.url;
			this._index = this.config.index || "paellaplayer";
			this._type = this.config.type || "usertracking";

			onSuccess(true);
		}

		_loadDeps() {
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
		}

		log(event, params) {
			var p = params;
			let self = this
			// console.log(event)
			// console.log(params)
			switch (event) {
				//Retrieve initial parameters from player
				case "paella:loadComplete":
				//TODO Obtain title and description localized
				this.user_agent = navigator.userAgent.toString();
				this.title = paella.player.videoLoader.getMetadata().title
				this.description = paella.player.videoLoader.getMetadata().description
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
				break;
			}
		}

		send(params){
			//TODO Get the user from LMS
			var agent = new ADL.XAPIStatement.Agent("mailto:annonymous@example.com", "Annonymous")
			var verb = new ADL.XAPIStatement.Verb(params.verb.id, params.verb.description)
			var activity = new ADL.XAPIStatement.Activity(window.location.href, this.title, this.description)
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

		send_interacted(current_time){
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
		// return 1
	}
}}
);
