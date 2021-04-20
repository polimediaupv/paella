paella.addPlugin(function() {
    var self = this;
    return class X5gonTracking extends paella.userTracking.SaverPlugIn {
        getName() { 
            return "org.opencast.usertracking.x5gonSaverPlugIn"; 
        };

        checkEnabled(onSuccess) {
            var urlCookieconsentJS = "https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.js",
                token = this.config.token,
                translations = [],
                path,
                testingEnvironment = this.config.testing_environment,
                trackingPermission,
                tracked;
           
            function trackX5gon() {
                paella.log.debug("X5GON: trackX5gon permission check [trackingPermission " + trackingPermission + "] [tracked " + tracked + "]");
                if (isTrackingPermission() && !tracked) {
                    if (!token) {
                        paella.log.debug("X5GON: token missing! Disabling X5gon PlugIn");
                        onSuccess(false);
                        }
                    else {
                        // load x5gon lib from remote server
                        paella.log.debug("X5GON: trackX5gon loading x5gon-snippet, token: " + token);
                        paella.require("https://platform.x5gon.org/api/v1/snippet/latest/x5gon-log.min.js")
                            .then((x5gon) => {
                                paella.log.debug("X5GON: external x5gon snippet loaded");
                                if (typeof x5gonActivityTracker !== 'undefined') {
                                    x5gonActivityTracker(token, testingEnvironment);
                                    paella.log.debug("X5GON: send data to X5gon servers");
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
                paella.require(urlCookieconsentJS)
                    .then((cookieconsent) => {
                        paella.log.debug("X5GON: external cookie consent lib loaded");
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
                            "position": "top",
                            "content": {
                                "message": translate('x5_message', "On this site the X5gon service can be included, to provide personalized Open Educational Ressources."),
                                "allow": translate('x5_accept', "Accept"),
                                "deny": translate('x5_deny', "Deny"),
                                "link": translate('x5_more_info', "More information"),
                                "policy": translate('x5_policy', "Cookie Policy"),
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
                        });
                    });
            }

            function initTranslate(language, funcSuccess, funcError) {
                paella.log.debug('X5GON: selecting language ' + language.slice(0,2));
                var jsonstr = window.location.origin + '/player/localization/paella_' + language.slice(0,2) + '.json';
                $.ajax({
                    url: jsonstr,
                    dataType: 'json',
                    success: function (data) {
                        if (data) {
                            data.value_locale = language;
                            translations = data;
                            if (funcSuccess) {
                                funcSuccess(translations);
                            }
                        } else if (funcError) {
                            funcError();
                        }
                    },
                    error: function () {
                        if (funcError) {
                            funcError();
                        }
                    }
                });
            }

            function translate(str, strIfNotFound) {
                return (translations[str] != undefined) ? translations[str] : strIfNotFound;
            }

            function isTrackingPermission() {
                if (checkDoNotTrackStatus() || !trackingPermission) {
                    return false;
                } else {
                    return true;   
                }  
            }

            function checkDoNotTrackStatus() {
                if (window.navigator.doNotTrack == 1 || window.navigator.msDoNotTrack == 1) {
                    paella.log.debug("X5GON: Browser DoNotTrack: true");
                    return true;
                }
                paella.log.debug("X5GON: Browser DoNotTrack: false");
                return false;
            }

            function setTrackingPermission(permissionStatus) {
                trackingPermission = permissionStatus;
                paella.log.debug("X5GON: trackingPermissions: " + permissionStatus);
                trackX5gon();
            };

            initTranslate(navigator.language, function () {
                paella.log.debug('X5GON: Successfully translated.');
                initCookieNotification();
            }, function () {
                paella.log.debug('X5gon: Error translating.');
                initCookieNotification();
            });

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
