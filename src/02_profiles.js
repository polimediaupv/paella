(function() {
    let g_profiles = [];

	paella.addProfile = function(cb) {
		cb().then((profileData) => {
			if (profileData) {
				g_profiles.push(profileData);
				paella.events.trigger(paella.events.profileListChanged, { profileData:profileData });
			}
		});
	}

	class Profiles {
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
                    return (result = profile.id==profileId);
                });
                result ? resolve(result) : reject(new Error("No such profile"));
            });
        }
    }

    paella.profiles = new Profiles();
    
    
})();