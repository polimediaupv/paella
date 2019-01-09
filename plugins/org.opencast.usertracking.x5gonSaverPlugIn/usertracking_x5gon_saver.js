paella.addPlugin(function() {
    return class X5gonTracking extends paella.userTracking.SaverPlugIn {
        getName() { 
            return "org.opencast.usertracking.x5gonSaverPlugIn"; 
        };

        checkEnabled(onSuccess) {
            
            /* don't change these variables */
            var token = this.config.token,
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
            }

            function trackX5gon() {
                console.log("X5gon: trackX5gon method call");
                if (isTrackingPermission() && !tracked) {
                    if (!token) {
                        base.log.debug("X5gon: token missing! Disabling X5gon PlugIn");
                        onSuccess(false);
                        }
                    else {
                        // load x5gon lib from remote server
                        console.log("X5gon: trackX5gon loading x5gon-snippet")
                        require(["https://platform.x5gon.org/api/v1/snippet/latest/x5gon-log.min.js"], function (x5gon) {
                            base.log.debug("X5gon: external x5gon snippet loaded");
                            console.log("X5gon: external x5gon snippet loaded");
                        });            
                        //x5gonActivityTracker('6j3hfn', testingEnvironment);
                        tracked = true;
                        base.log.debug("X5gon: send data to X5gon servers");
                        onSuccess(true);
                    }
                }
            }

            function isTrackingPermission() {
                if (isDoNotTrackStatus()) {
                    console.log("X5gon: trackingPermissions: false");
                    return false;
                } else {
                    console.log("X5gon: trackingPermissions: true");
                    return true;   
                }  
            }

            function setTrackingPermission(status) {
                //Basil.set(status);
                //storedConsent = status;
                //trackingPermission = status;
                //trackX5gon(); 
            };

            trackX5gon();
            onSuccess(true);
        };

        log(event, params) {
            if ((this.config.category === undefined) || (this.config.category === true)) {
                var category = this.config.category || "PaellaPlayer";
                var action = event;
                var label = "";

                try {
                    label = JSON.stringify(params);
                } catch (e) {}
            }
        };
    };
});