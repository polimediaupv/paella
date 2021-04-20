/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/

(() => {

	class VideoLoader {
		constructor() {
			this.metadata = {		// Video metadata
				title:"",
				duration:0
			};
			this.streams = [];		// {sources:{mp4:{src:"videourl.mp4",type:"video/mp4"},
									//			 ogg:{src:"videourl.ogv",type:"video/ogg"},
									//			 webm:{src:"videourl.webm",type:"video/webm"},
									//			 flv:{src:"videourl.flv",type:"video/x-flv"},
									//			 rtmp:{src:"rtmp://server.com/endpoint/url.loquesea",type="video/mp4 | video/x-flv"},
									//			 image:{frames:{frame_1:'frame_1.jpg',...frame_n:'frame_n.jpg'},duration:183},
									//	preview:'video_preview.jpg'}
			this.frameList = [];	// frameList[timeInstant] = { id:"frame_id", mimetype:"image/jpg", time:timeInstant, url:"image_url"}

			this.loadStatus = false;
			this.codecStatus = false;
		}
	
		getMetadata() {
			return this.metadata;
		}
	
		getVideoId() {
			return paella.initDelegate.getId();
		}
	
		getVideoUrl() {
			// This function must to return the base video URL
			return "";
		}
	
		getDataUrl() {
			// This function must to return the location of the video data file
		}
	
		loadVideo(onSuccess) {
			// This function must to:
			//	- load this.streams and this.frameList
			// 	- Check streams compatibility using this.isStreamCompatible(streamIndex)
			//	- Set this.loadStatus = true if load is Ok, or false if something gone wrong
			//	- Set this.codecStatus = true if the browser can reproduce all streams
			//	- Call onSuccess()
			onSuccess();
		}
	}

	paella.VideoLoader = VideoLoader;
	
	class AccessControl {
		canRead() {
			return paella_DeferredResolved(true);
		}
	
		canWrite() {
			return paella_DeferredResolved(false);
		}
	
		userData() {
			return paella_DeferredResolved({
				username: 'anonymous',
				name: 'Anonymous',
				avatar: paella.utils.folders.resources() + '/images/default_avatar.png',
				isAnonymous: true
			});
		}
	
		getAuthenticationUrl(callbackParams) {
			var authCallback = this._authParams.authCallbackName && window[this._authParams.authCallbackName];
			if (!authCallback && paella.player.config.auth) {
				authCallback = paella.player.config.auth.authCallbackName && window[paella.player.config.auth.authCallbackName];
			}
	
			if (typeof(authCallback)=="function") {
				return authCallback(callbackParams);
			}
			return "";
		}
	}

	paella.AccessControl = AccessControl;
	
	class PlayerBase {
		
		checkCompatibility() {
			let message = "";
			if (paella.utils.parameters.get('ignoreBrowserCheck')) {
				return true;
			}
			if (paella.utils.userAgent.browser.IsMobileVersion) return true;
			let isCompatible =	paella.utils.userAgent.browser.Chrome ||
								paella.utils.userAgent.browser.EdgeChromium ||
								paella.utils.userAgent.browser.Safari ||
								paella.utils.userAgent.browser.Firefox ||
								paella.utils.userAgent.browser.Opera ||
								paella.utils.userAgent.browser.Edge ||
								(paella.utils.userAgent.browser.Explorer && paella.utils.userAgent.browser.Version.major>=9);
			if (isCompatible) {
				return true;
			}
			else {
				var errorMessage = paella.utils.dictionary.translate("It seems that your browser is not HTML 5 compatible");
				paella.events.trigger(paella.events.error,{error:errorMessage});
				message = errorMessage + '<div style="display:block;width:470px;height:140px;margin-left:auto;margin-right:auto;font-family:Verdana,sans-sherif;font-size:12px;"><a href="http://www.google.es/chrome" style="color:#004488;float:left;margin-right:20px;"><img src="'+paella.utils.folders.resources()+'images/chrome.png" style="width:80px;height:80px" alt="Google Chrome"></img><p>Google Chrome</p></a><a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home" style="color:#004488;float:left;margin-right:20px;"><img src="'+paella.utils.folders.resources()+'images/explorer.png" style="width:80px;height:80px" alt="Internet Explorer 9"></img><p>Internet Explorer 9</p></a><a href="http://www.apple.com/safari/" style="float:left;margin-right:20px;color:#004488"><img src="'+paella.utils.folders.resources()+'images/safari.png" style="width:80px;height:80px" alt="Safari"></img><p>Safari 5</p></a><a href="http://www.mozilla.org/firefox/" style="float:left;color:#004488"><img src="'+paella.utils.folders.resources()+'images/firefox.png" style="width:80px;height:80px" alt="Firefox"></img><p>Firefox 12</p></a></div>';
				message += '<div style="margin-top:30px;"><a id="ignoreBrowserCheckLink" href="#" onclick="window.location = window.location + \'&ignoreBrowserCheck=true\'">' + paella.utils.dictionary.translate("Continue anyway") + '</a></div>';
				paella.messageBox.showError(message,{height:'40%'});
			}
			return false;
		}
	
		constructor(playerId) {
			this.config = null;
			this.playerId = '';
			this.mainContainer = null;
			this.videoContainer = null;
			this.controls = null;
			this.accessControl = null;
	
			if (paella.utils.parameters.get('log') != undefined) {
				var log = 0;
				switch(paella.utils.parameters.get('log')) {
					case "error":
						log = paella.log.kLevelError;
						break;					
					case "warn":
						log = paella.log.kLevelWarning;
						break;					
					case "debug":
						log = paella.log.kLevelDebug;
						break;					
					case "log":
					case "true":
						log = paella.log.kLevelLog;
						break;
				}
				paella.log.setLevel(log);
			}		
				
			if (!this.checkCompatibility()) {
				paella.log.debug('It seems that your browser is not HTML 5 compatible');
			}
			else {
				paella.player = this;
				this.playerId = playerId;
				this.mainContainer = $('#' + this.playerId)[0];
				var thisClass = this;
				paella.events.bind(paella.events.loadComplete,function(event,params) { thisClass.loadComplete(event,params); });
			}
		}

		get repoUrl() { return paella.player.videoLoader._url || paella.player.config.standalone && paella.player.config.standalone.repository; }
		get videoUrl() { return paella.player.videoLoader.getVideoUrl(); }
		get dataUrl() { return paella.player.videoLoader.getDataUrl(); }
		get videoId() { return paella.initDelegate.getId(); }
		get startMuted() { return /true/.test(paella.utils.parameters.get("muted")); }
	
		loadComplete(event,params) {
	
		}
	
		get auth() {
			return {
				login: function(redirect) {
					redirect = redirect || window.location.href;
					var url = paella.initDelegate.initParams.accessControl.getAuthenticationUrl(redirect);
					if (url) {
						window.location.href = url;
					}
				},
		
				// The following functions returns promises
				canRead:function() {
					return paella.initDelegate.initParams.accessControl.canRead();
				},
		
				canWrite:function() {
					return paella.initDelegate.initParams.accessControl.canWrite();
				},
		
				userData:function() {
					return paella.initDelegate.initParams.accessControl.userData();
				}
			}
		}
	}

	paella.PlayerBase = PlayerBase;
	
	class InitDelegate {
		get initParams() {
			if (!this._initParams) {
				this._initParams = {
					configUrl:paella.baseUrl + 'config/config.json',
					dictionaryUrl:paella.baseUrl + 'localization/paella',
					accessControl:null,
					videoLoader:null,
					disableUserInterface: function() {
						return /true/i.test(paella.utils.parameters.get("disable-ui"));
					}
					// Other parameters set externally:
					//	config: json containing the configuration file
					//	loadConfig: function(defaultConfigUrl). Returns a promise with the config.json data
					//	url: attribute. Contains the repository base URL
					//	videoUrl: function. Returns the base URL of the video (example: baseUrl + videoID)
					//	dataUrl: function. Returns the full URL to get the data.json file
					//	loadVideo: Function. Returns a promise with the data.json file content
					//  disableUserInterface: Function. Returns true if the user interface should be disabled (only shows the video container)
				};
			}
			return this._initParams;
		}
	
		constructor(params) {
			if (arguments.length==2) {
				this._config = arguments[0];
			}
	
			if (params) {
				for (var key in params) {
					this.initParams[key] = params[key];
				}
			}

			if (!this.initParams.getId) {
				this.initParams.getId = function() {
					return paella.utils.parameters.get('id') || "noid";
				} 
			}
		}
	
		getId() {
			return this.initParams.getId();
		}
	
		loadDictionary() {
			return new Promise((resolve) => {
				paella.utils.ajax.get({ url:this.initParams.dictionaryUrl + "_" + paella.utils.dictionary.currentLanguage() + '.json' }, function(data,type,returnCode) {
					paella.utils.dictionary.addDictionary(data);
					resolve(data);
				},
				function(data,type,returnCode) {
					resolve();
				});
			});
		}
	
		loadConfig() {
			let loadAccessControl = (data) => {
				var AccessControlClass = paella.utils.objectFromString(data.player.accessControlClass || "paella.AccessControl");
				this.initParams.accessControl = new AccessControlClass();
			};
	
			if (this.initParams.config) {
				return new Promise((resolve) => {
					loadAccessControl(this.initParams.config);
					resolve(this.initParams.config);
				})
			}
			else if (this.initParams.loadConfig) {
				return new Promise((resolve,reject) => {
					this.initParams.loadConfig(this.initParams.configUrl)
						.then((data) => {
							loadAccessControl(data);
							resolve(data);
						})
						.catch((err) => {
							reject(err);
						});
				})
			}
			else {
				return new Promise((resolve,reject) => {
					var configUrl = this.initParams.configUrl;
					var params = {};
					params.url = configUrl;
					paella.utils.ajax.get(params,(data,type,returnCode) => {
							try {
								data = JSON.parse(data);
							}
							catch(e) {}
							loadAccessControl(data);
							resolve(data);
						},
						function(data,type,returnCode) {
							paella.messageBox.showError(paella.utils.dictionary.translate("Error! Config file not found. Please configure paella!"));
							//onSuccess({});
						});
				});
			}
		}
	}

	paella.InitDelegate = InitDelegate;
	
	window.paellaPlayer = null;
	paella.plugins = {};
	paella.plugins.events = {};
	paella.initDelegate = null;
	
})();

