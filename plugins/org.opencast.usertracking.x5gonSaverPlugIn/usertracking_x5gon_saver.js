paella.addPlugin(function () {
    return class X5gonTracking extends paella.userTracking.SaverPlugIn {
        getName() {
            return "org.opencast.usertracking.x5gonSaverPlugIn";
        }

        checkEnabled(onSuccess) {
            console.log("test");

            /* don't change these variables */
            var token = this.config.trackingID,
                mediapackageError = false,
                allow_tracking = true,
                path,
                storage_tracking_permission = "x5gon_tracking",
                trackingPermission,
                tracked = false;

            //storedConsent = Basil.get(storage_tracking_permission);

            allow_tracking = !isDoNotTrackStatus();

            function isDoNotTrackStatus() {
                if (window.navigator.doNotTrack == 1 || window.navigator.msDoNotTrack == 1) {
                    return true;
                }
                return false;
            };

            //trackX5gon();

            function trackX5gon(onSuccess) {
                if (isTrackingPermission() && !tracked) {
                    if (!token) {
                        base.log("X5gon: token missing! Disabling X5gon PlugIn");
                        onSuccess(false);
                    } else {
                        //x5gonActivityTracker('6j3hfn', testingEnvironment);
                        tracked = true;
                        base.log("X5gon: send data to X5gon servers");
                        onSuccess(true);
                    }
                }
            };

            function isTrackingPermission() {
                if (isDoNotTrackStatus()) return false;
                if (trackingPermission === undefined) {
                    trackingPermission = storedConsent;
                    if (trackingPermission === undefined) {
                        return false;
                    }
                }
                return trackingPermission;
            }

            function setTrackingPermission(status) {
                //Basil.set(status);
                //storedConsent = status;
                //trackingPermission = status;
                //trackX5gon(); 
            };
        }

        log(event, params) {
            if ((this.config.category === undefined) || (this.config.category === true)) {
                var category = this.config.category || "PaellaPlayer";
                var action = event;
                var label = "";

                try {
                    label = JSON.stringify(params);
                } catch (e) {}
            }
        }
    }
});