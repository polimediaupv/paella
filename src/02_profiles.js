(function() {
    let g_profiles = [];
    let g_monostreamProfile = null;

	paella.addProfile = function(cb) {
		cb().then((profileData) => {
			if (profileData) {
				g_profiles.push(profileData);
				paella.events.trigger(paella.events.profileListChanged, { profileData:profileData });
			}
		});
    }
    
    paella.setMonostreamProfile = function(cb) {
        cb().then((profileData) => {
            g_monostreamProfile = profileData;
        })
    }

    // Utility functions
    function hideAllLogos() {
        for (var i=0;i<this.logos.length;++i) {
            var logoId = this.logos[i];
            var logo = this.container.getNode(logoId);
            $(logo.domElement).hide();
        }
    }

    function showLogos(logos) {
        if (logos == undefined) return;
        var relativeSize = new paella.RelativeVideoSize();
        for (var i=0; i<logos.length;++i) {
            var logo = logos[i];
            var logoId = logo.content;
            var logoNode = this.container.getNode(logoId);
            var rect = logo.rect;
            if (!logoNode) {
                style = {};
                logoNode = this.container.addNode(new paella.DomNode('img',logoId,style));
                logoNode.domElement.setAttribute('src', paella.utils.folders.profiles() + '/resources/' + logoId);
                logoNode.domElement.setAttribute('src', paella.utils.folders.profiles() + '/resources/' + logoId);
            }
            else {
                $(logoNode.domElement).show();
            }
            var percentTop = relativeSize.percentVSize(rect.top) + '%';
            var percentLeft = relativeSize.percentWSize(rect.left) + '%';
            var percentWidth = relativeSize.percentWSize(rect.width) + '%';
            var percentHeight = relativeSize.percentVSize(rect.height) + '%';
            var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:logo.zIndex};
            $(logoNode.domElement).css(style);
        }
    }

    function getClosestRect(profileData,videoDimensions) {
        var minDiff = 10;
        var re = /([0-9\.]+)\/([0-9\.]+)/;
        var result = profileData.rect[0];
        var videoAspectRatio = videoDimensions.h==0 ? 1.777777:videoDimensions.w / videoDimensions.h;
        var profileAspectRatio = 1;
        var reResult = false;
        profileData.rect.forEach(function(rect) {
            if ((reResult = re.exec(rect.aspectRatio))) {
                profileAspectRatio = Number(reResult[1]) / Number(reResult[2]);
            }
            var diff = Math.abs(profileAspectRatio - videoAspectRatio);
            if (minDiff>diff) {
                minDiff = diff;
                result = rect;
            }
        });
        return result;
    }

    function applyProfileWithJson_old(profileData,animate) {
        var doApply = function(masterData, slaveData) {
            if (animate==undefined) animate = true;
            let video1 = this.videoWrappers[0];
            let video2 = this.videoWrappers.length>1 ? this.videoWrappers[1] : null;
            let videoPlayer1 = this.masterVideo();
            let videoPlayer2 = this.slaveVideo();

            let background = this.container.getNode(this.backgroundId);

            let masterDimensions = masterData.res;
            let slaveDimensions = slaveData && slaveData.res;
            let rectMaster = getClosestRect(profileData.masterVideo,masterData.res);
            let rectSlave = slaveData && getClosestRect(profileData.slaveVideo,slaveData.res);

            // Logos
            // Hide previous logos
            hideAllLogos.apply(paella.player.videoContainer);

            // Create or show new logos
            showLogos.apply(this,[profileData.logos]);

            if (dynamic_cast("paella.ProfileFrameStrategy",this.profileFrameStrategy)) {
                var containerSize = { width:$(this.domElement).width(), height:$(this.domElement).height() };
                var scaleFactor = rectMaster.width / containerSize.width;
                var scaledMaster = { width:masterDimensions.w*scaleFactor, height:masterDimensions.h*scaleFactor };
                rectMaster.left = Number(rectMaster.left);
                rectMaster.top = Number(rectMaster.top);
                rectMaster.width = Number(rectMaster.width);
                rectMaster.height = Number(rectMaster.height);
                rectMaster = this.profileFrameStrategy.adaptFrame(scaledMaster,rectMaster);
                if (video2) {
                    var scaledSlave = { width:slaveDimensions.w * scaleFactor, height:slaveDimensions.h * scaleFactor };
                    rectSlave.left = Number(rectSlave.left);
                    rectSlave.top = Number(rectSlave.top);
                    rectSlave.width = Number(rectSlave.width);
                    rectSlave.height = Number(rectSlave.height);
                    rectSlave = this.profileFrameStrategy.adaptFrame(scaledSlave,rectSlave);
                }
            }

            video1.setRect(rectMaster,animate);
            this.currentMasterVideoRect = rectMaster;
            video1.setVisible(profileData.masterVideo.visible,animate);
            this.currentMasterVideoRect.visible = /true/i.test(profileData.masterVideo.visible) ? true:false;
            this.currentMasterVideoRect.layer = parseInt(profileData.masterVideo.layer);
            if (video2) {
                video2.setRect(rectSlave,animate);
                this.currentSlaveVideoRect = rectSlave;
                this.currentSlaveVideoRect.visible = /true/i.test(profileData.slaveVideo.visible) ? true:false;
                this.currentSlaveVideoRect.layer = parseInt(profileData.slaveVideo.layer);
                video2.setVisible(profileData.slaveVideo.visible,animate);
                video2.setLayer(profileData.slaveVideo.layer);
            }
            video1.setLayer(profileData.masterVideo.layer);
            if (profileData.background) {
                background.setImage(paella.utils.folders.profiles() + '/resources/' + profileData.background.content);
            }
        };
        
        if (!this.masterVideo()) {
            return;
        }
        else if (!this.slaveVideo()) {		
            this.masterVideo().getVideoData()
                .then((data) => {
                    doApply.apply(this, [ data ]);
                });
        }
        else {
            var masterVideoData = {};		
            this.masterVideo().getVideoData()
                .then((data) => {
                    masterVideoData = data;
                    return this.slaveVideo().getVideoData();
                })
                
                .then((slaveVideoData) => {
                    doApply.apply(this, [ masterVideoData, slaveVideoData ]);
                });
        }
    }

    function applyProfileWithJson(profileData,animate) {
        if (animate==undefined) animate = true;
        let getProfile = (content) => {
            let result = null;
            profileData.videos.some((videoProfile) => {
                if (videoProfile.content==content) {
                    result = videoProfile;
                }
                return result!=null;
            });
            return result;
        };

        let applyVideoRect = (profile,videoData,videoWrapper,player) => {
            let frameStrategy = this.profileFrameStrategy;
            if (frameStrategy) {
                let rect = getClosestRect(profile,videoData.res);
                let videoSize = videoData.res;
                let containerSize = { width:$(this.domElement).width(), height:$(this.domElement).height() };
                let scaleFactor = rect.width / containerSize.width;
                let scaledVideoSize = { width:videoSize.w * scaleFactor, height:videoSize.h * scaleFactor };
                rect.left = Number(rect.left);
                rect.top = Number(rect.top);
                rect.width = Number(rect.width);
                rect.height = Number(rect.height);
                rect = frameStrategy.adaptFrame(scaledVideoSize,rect);
                
                let visible = /true/i.test(profile.visible);
                rect.visible = visible;
                let layer = parseInt(profile.layer);

                videoWrapper.setRect(rect,animate);
                videoWrapper.setVisible(profile.visible,animate);

                // The disable/enable functions may not be called on main audio player
                if (paella.player.videoContainer.streamProvider.mainAudioPlayer!=player) {

                    profile.visible ? player.enable() : player.disable();
                }
            }
        };
        
        this.streamProvider.videoStreams.forEach((streamData,index) => {
            let profile = getProfile(streamData.content);
            let player = this.streamProvider.videoPlayers[index];
            let videoWrapper = this.videoWrappers[index];
            if (profile) {
                player.getVideoData()
                    .then((data) => {
                        applyVideoRect(profile,data,videoWrapper,player);
                    });
            }
            else {
                videoWrapper.setVisible(false,animate);
                if (paella.player.videoContainer.streamProvider.mainAudioPlayer!=player) {
                    player.disable();
                }
            }
        })
    }

	class Profiles {
        constructor() {
            this._currentProfileName;
        }

        get profileList() { return g_profiles; }

        getDefaultProfile() {
            if (paella.player.videoContainer.masterVideo() && paella.player.videoContainer.masterVideo().defaultProfile()) {
                return paella.player.videoContainer.masterVideo().defaultProfile();
            }
            if (paella.player && paella.player.config && paella.player.config.defaultProfile) {
                return paella.player.config.defaultProfile;
            }
            return undefined;
        }

        loadProfile(profileId) {
            return new Promise((resolve,reject) => {
                let result = null;
                g_profiles.some((profile) => {
                    if (profile.id==profileId) {
                        result = profile;
                    }
                    return result;
                });
                result ? resolve(result) : reject(new Error("No such profile"));
            });
        }

        loadMonostreamProfile() {
            return new Promise((resolve,reject) => {
                resolve(g_monostreamProfile);
            })
        }

        get currentProfile() { return null; }

        get currentProfileName() { return this._currentProfileName; }

        setProfile(profileName,animate) {
            return new Promise((resolve,reject) => {
				animate = base.userAgent.browser.Explorer ? false:animate;
				if (!paella.player.videoContainer.ready) {
					resolve();	// Nothing to do, the video is not loaded
				}
				else if (paella.player.videoContainer.streamProvider.videoStreams.length==1) {
                    this.loadMonostreamProfile()
                        .then((profileData) => {
                            this._currentProfileName = profileName;
                            applyProfileWithJson.apply(paella.player.videoContainer,[profileData,animate]);
                            resolve(profileName);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
                else {
                    this.loadProfile(profileName)
                        .then((profileData) => {
                            this._currentProfileName = profileName;
                            applyProfileWithJson.apply(paella.player.videoContainer,[profileData,animate]);
                            resolve(profileName);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
			});
        }

        getProfile(profileName) {

        }
    }

    paella.profiles = new Profiles();
    
    
})();