(function() {
    let g_profiles = [];
    let g_monostreamProfile = null;

	paella.addProfile = function(cb) {
		cb().then((profileData) => {
			if (profileData) {
                g_profiles.push(profileData);
                if (typeof(profileData.onApply)!="function") {
                    profileData.onApply = function() { return Promise.resolve(); }
                }
				paella.events.trigger(paella.events.profileListChanged, { profileData:profileData });
			}
		});
    }
    
    paella.setMonostreamProfile = function(cb) {
        cb().then((profileData) => {
            if (typeof(profileData.onApply)!="function") {
                profileData.onApply = function() { return Promise.resolve(); }
            }
            g_monostreamProfile = profileData;
        })
    }

    // Utility functions
    function hideBackground() {
        let bkgNode = this.container.getNode("videoContainerBackground");
        if (bkgNode) this.container.removeNode(bkgNode);
    }

    function showBackground(bkgData) {
        hideBackground.apply(this);
        this.backgroundData = bkgData;
        let style = {
            backgroundImage: `url(${ paella.baseUrl }/resources/style/${ bkgData.content })`,
            backgroundSize: "100% 100%",
            zIndex: bkgData.layer,
            position: 'absolute',
            left: bkgData.rect.left + "px",
            right: bkgData.rect.right + "px",
            width: "100%",
            height: "100%",
        }
        this.container.addNode(new paella.DomNode('div',"videoContainerBackground",style));
    }

    function hideAllLogos() {
        if (this.logos == undefined) return;
        for (var i=0;i<this.logos.length;++i) {
            var logoId = this.logos[i].content.replace(/\./ig,"-");
            var logo = this.container.getNode(logoId);
            $(logo.domElement).hide();
        }
    }

    function showLogos(logos) {
        this.logos = logos;
        var relativeSize = new paella.RelativeVideoSize();
        for (var i=0; i<logos.length;++i) {
            var logo = logos[i];
            var logoId = logo.content.replace(/\./ig,"-");
            var logoNode = this.container.getNode(logoId);
            var rect = logo.rect;
            if (!logoNode) {
                style = {};
                logoNode = this.container.addNode(new paella.DomNode('img',logoId,style));
                logoNode.domElement.setAttribute('src', paella.baseUrl + '/resources/style/' + logo.content);
            }
            else {
                $(logoNode.domElement).show();
            }
            var percentTop = Number(relativeSize.percentVSize(rect.top)) + '%';
            var percentLeft = Number(relativeSize.percentWSize(rect.left)) + '%';
            var percentWidth = Number(relativeSize.percentWSize(rect.width)) + '%';
            var percentHeight = Number(relativeSize.percentVSize(rect.height)) + '%';
            var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:logo.zIndex};
            $(logoNode.domElement).css(style);
        }
    }

    function hideButtons() {
        if (this.buttons) {
            this.buttons.forEach((btn) => {
                this.container.removeNode(this.container.getNode(btn.id));
            });
            this.buttons = null;
        }
    }

    function showButtons(buttons,profileData) {
        hideButtons();
        if (buttons) {
            let relativeSize = new paella.RelativeVideoSize();
            this.buttons = buttons;
            buttons.forEach((btn,index) => {
                btn.id = "button_" + index;
                let rect = btn.rect;
                let percentTop = relativeSize.percentVSize(rect.top) + '%';
                let percentLeft = relativeSize.percentWSize(rect.left) + '%';
                let percentWidth = relativeSize.percentWSize(rect.width) + '%';
                let percentHeight = relativeSize.percentVSize(rect.height) + '%';
                let style = {
                    top:percentTop,
                    left:percentLeft,
                    width:percentWidth,
                    height:percentHeight,
                    position:'absolute',
                    zIndex:btn.layer,
                    backgroundImage: `url(${ paella.baseUrl }/resources/style/${ btn.icon })`,
                    backgroundSize: '100% 100%',
                    display: 'block'
                };
                let logoNode = this.container.addNode(new paella.DomNode('button',btn.id,style));
                logoNode.domElement.className = "paella-profile-button";
                logoNode.domElement.data = {
                    action: btn.onClick,
                    profileData: profileData
                }
                $(logoNode.domElement).click(function(evt) {
                    this.data.action.apply(this.data.profileData,[evt]);
                    evt.stopPropagation();
                    return false;
                })
            })
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
        
        profileData.onApply().then(() => {
            hideAllLogos.apply(this);
            showLogos.apply(this,[profileData.logos]);
            hideBackground.apply(this);
            showBackground.apply(this,[profileData.background]);
            hideButtons.apply(this);
            showButtons.apply(this,[profileData.buttons, profileData]);
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
            });
        });
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

        get currentProfile() { return this.getProfile(this._currentProfileName); }

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

        placeVideos() {
            this.setProfile(this._currentProfileName,false);
        }
    }

    paella.profiles = new Profiles();
    
    
})();