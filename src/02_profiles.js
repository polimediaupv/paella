(function() {
    let g_profiles = [];

	paella.addProfile = function(cb) {
		cb().then((profileData) => {
			if (profileData) {
                g_profiles.push(profileData);
                if (typeof(profileData.onApply)!="function") {
                    profileData.onApply = function() { }
                }
                if (typeof(profileData.onDeactivte)!="function") {
                    profileData.onDeactivate = function() {}
                }
				paella.events.trigger(paella.events.profileListChanged, { profileData:profileData });
			}
		});
    }
    
    // Utility functions
    function hideBackground() {
        let bkgNode = this.container.getNode("videoContainerBackground");
        if (bkgNode) this.container.removeNode(bkgNode);
    }

    function showBackground(bkgData) {
        if (!bkgData) return;
        hideBackground.apply(this);
        this.backgroundData = bkgData;
        let style = {
            backgroundImage: `url(${paella.baseUrl}${paella.utils.folders.get("resources")}/style/${ bkgData.content })`,
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
                logoNode.domElement.setAttribute('src', `${paella.baseUrl}${paella.utils.folders.get("resources")}/style/${logo.content}`);
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
        hideButtons.apply(this);
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
                let url = paella.baseUrl;
                url = url.replace(/\\/ig,'/');
                let style = {
                    top:percentTop,
                    left:percentLeft,
                    width:percentWidth,
                    height:percentHeight,
                    position:'absolute',
                    zIndex:btn.layer,
                    backgroundImage: `url(${paella.baseUrl}${paella.utils.folders.get("resources")}/style/${ btn.icon })`,
                    backgroundSize: '100% 100%',
                    display: 'block'
                };
                let logoNode = this.container.addNode(new paella.DomNode('div',btn.id,style));
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
        if (!profileData) return;
        let getProfile = (content) => {
            let result = null;
            
                profileData && profileData.videos.some((videoProfile) => {
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
                videoWrapper.domElement.style.zIndex = layer;

                videoWrapper.setRect(rect,animate);
                videoWrapper.setVisible(visible,animate);

                // The disable/enable functions may not be called on main audio player
                let isMainAudioPlayer = paella.player.videoContainer.streamProvider.mainAudioPlayer==player;
                visible ? player.enable(isMainAudioPlayer) : player.disable(isMainAudioPlayer);
            }
        };
        
        profileData && profileData.onApply();
        hideAllLogos.apply(this);
        profileData && showLogos.apply(this,[profileData.logos]);
        hideBackground.apply(this);
        profileData && showBackground.apply(this,[profileData.background]);
        hideButtons.apply(this);
        profileData && showButtons.apply(this,[profileData.buttons, profileData]);
        
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
            else if (videoWrapper) {
                videoWrapper.setVisible(false,animate);
                player.disable(paella.player.videoContainer.streamProvider.mainAudioPlayer==player);
            }
        });
    }

    let profileReloadCount = 0;
    const maxProfileReloadCunt = 20;

	class Profiles {
        constructor() {
            paella.events.bind(paella.events.controlBarDidHide, () => this.hideButtons());
            paella.events.bind(paella.events.controlBarDidShow, () => this.showButtons());

            paella.events.bind(paella.events.profileListChanged, () => {
                if (paella.player && paella.player.videoContainer && 
                    (!this.currentProfile || this.currentProfileName!=this.currentProfile.id))
                {
                    this.setProfile(this.currentProfileName,false);
                }
            })
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
            let result = null;
            g_profiles.some((profile) => {
                if (profile.id==profileId) {
                    result = profile;
                }
                return result;
            });
            return result;
        }

        get currentProfile() { return this.getProfile(this._currentProfileName); }

        get currentProfileName() { return this._currentProfileName; }

        setProfile(profileName,animate) {
            
            if (!profileName) {
                return false;
            }
            
            animate = paella.utils.userAgent.browser.Explorer ? false:animate;
            if (this.currentProfile) {
                this.currentProfile.onDeactivate();
            }

            if (!paella.player.videoContainer.ready) {
                return false;	// Nothing to do, the video is not loaded
            }
            else {
                let profileData = this.loadProfile(profileName) || (g_profiles.length>0 && g_profiles[0]);
                if (!profileData && g_profiles.length==0) {
                    if (profileReloadCount < maxProfileReloadCunt) {
                        profileReloadCount++;
                        // Try to load the profile again later, maybe the profiles are not loaded yet
                        setTimeout(() => {
                            this.setProfile(profileName,animate);
                        },100);
                        return false;
                    }
                    else {
                        console.error("No valid video layout profiles were found. Check that the 'content' attribute setting in 'videoSets', at config.json file, matches the 'content' property in the video manifest.");
                        return false;
                    }
                }
                else {
                    this._currentProfileName = profileName;
                    applyProfileWithJson.apply(paella.player.videoContainer,[profileData,animate]);
                    return true;
                }
            }
        }

        getProfile(profileName) {
            let result = null;
            this.profileList.some((p) => {
                if (p.id==profileName) {
                    result = p;
                    return true;
                }
            })
            return result;
        }

        placeVideos() {
            this.setProfile(this._currentProfileName,false);
        }

        hideButtons() {
            $('.paella-profile-button').hide();
        }

        showButtons() {
            $('.paella-profile-button').show();
        }
    }

    paella.profiles = new Profiles();
    
    
})();