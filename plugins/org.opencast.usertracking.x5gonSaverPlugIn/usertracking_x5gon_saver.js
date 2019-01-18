paella.addPlugin(function() {
    var self = this;
    return class X5gonTracking extends paella.userTracking.SaverPlugIn {
        getName() { 
            return "org.opencast.usertracking.x5gonSaverPlugIn"; 
        };

        checkEnabled(onSuccess) {
            console.log(navigator.language);
            
            /* don't change these variables */
            var urlCookieconsentJS = "https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.js";
            var token = this.config.token,
                testingEnvironment = this.config.testing_environment,
                storage_tracking_permission = "x5gon_tracking",
                trackingPermission,
                tracked;

            //TODO: Basil einbinden (Problem mit windows objekt, scope?)
            //Basil storage init
            var basilOptions = {
                namespace: 'mhStorage'
            };
            //basil = new window.Basil(basilOptions);
            
            var storedConsent //= basil.get(storage_tracking_permission);

            console.log(window);
            
            function trackX5gon() {
                console.log("X5gon: trackX5gon permission check [trackingPermission " + trackingPermission + "] [tracked " + tracked + "]");
                if (isTrackingPermission() && !tracked) {
                    if (!token) {
                        base.log.debug("X5gon: token missing! Disabling X5gon PlugIn");
                        onSuccess(false);
                        }
                    else {
                        // load x5gon lib from remote server
                        console.log("X5gon: trackX5gon loading x5gon-snippet, token: " + token);
                        require(["https://platform.x5gon.org/api/v1/snippet/latest/x5gon-log.min.js"], function (x5gon) {
                            base.log.debug("X5gon: external x5gon snippet loaded");
                            console.log("X5gon: external x5gon snippet loaded");

                            if (typeof x5gonActivityTracker !== 'undefined') {
                                x5gonActivityTracker(token, testingEnvironment);
                                base.log.debug("X5gon: send data to X5gon servers");
                                console.log("X5gon: send data to X5gon servers");
                                tracked = true;
                            }                                             
                        });
                    }
                    onSuccess(true);
                } else {
                    onSuccess(false);
                }
            }

            function initCookieNotification() {
                // load cookieconsent lib from remote server
                require([urlCookieconsentJS], function (cookieconsent) {
                    console.log("X5gon: external cookie consent lib loaded");

                    window.cookieconsent.initialise({
                        "palette": {
                            "popup": {
                                "background": "#1d8a8a"
                            },
                            "button": {
                                "background": "#62ffaa"
                            }
                        },
                        "type": "opt-in",
                        "content": {
                            "message": "On this site the X5gon service can be included, to provide personalized Open Educational Ressources.",
                            "dismiss": "Deny",
                            "allow": "Accept",
                            "link": "More information",
                            // link to the X5GON platform privacy policy - describing what are we collecting
                            // through the platform
                            "href": "https://platform.x5gon.org/privacy-policy"
                        },
                        onInitialise: function (status) {
                            var type = this.options.type;
                            var didConsent = this.hasConsented();
                            // enable cookies - send user data to the platform
                            // only if the user enabled cookies
                            if (type == 'opt-in' && didConsent) {
                                setTrackingPermission(true);
                            } else {
                                setTrackingPermission(false);
                            }
                        },
                        onStatusChange: function (status, chosenBefore) {
                            var type = this.options.type;
                            var didConsent = this.hasConsented();
                            // enable cookies - send user data to the platform
                            // only if the user enabled cookies
                            if (type == 'opt-in' && didConsent) {
                                setTrackingPermission(true);
                            } else {
                                setTrackingPermission(false);
                            }
                        },
                        onRevokeChoice: function () {
                            var type = this.options.type;
                            var didConsent = this.hasConsented();
                            // disable cookies - set what to do when
                            // the user revokes cookie usage
                            if (type == 'opt-in' && didConsent) {
                                setTrackingPermission(true);
                            } else {
                                setTrackingPermission(false);
                            }
                        }
                    })
                })
            }
            
            function isTrackingPermission() {
                if (isDoNotTrackStatus() || !trackingPermission) {
                    return false;
                } else {
                    return true;   
                }  
            }

            function isDoNotTrackStatus() {
                if (window.navigator.doNotTrack == 1 || window.navigator.msDoNotTrack == 1) {
                    console.log("X5gon: Browser DoNotTrack: true");
                    return true;
                }
                console.log("X5gon: Browser DoNotTrack: false");
                return false;
            }

            function setTrackingPermission(permissionStatus) {
                //TODO: Basil storage status
                //basil.set(status);
                storedConsent = permissionStatus;
                trackingPermission = permissionStatus;
                console.log("X5gon: trackingPermissions: " + permissionStatus);
                trackX5gon();
            };

            //TODO: Übersetzung implementieren

            //TODO: console.log() überall entfernen

            initCookieNotification();
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