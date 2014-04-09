paella.plugins.UserTrackingGoogleAnalyticsSaverPlugIn = Class.create(paella.EventDrivenPlugin,{
	getName:function() { return "es.upv.paella.userTrackingGoogleAnalyticsSaverPlugIn"; },
	getEvents:function() { return [paella.events.userTracking]; },
	
	

	checkEnabled:function(onSuccess) {
		var trackingID = this.config.trackingID;
		var domain = this.config.domain || "auto";
		if (trackingID){
			paella.debug.log("Google Analitycs Enabled");
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,'script','//www.google-analytics.com/analytics.js','__gaTracker');
			
			__gaTracker('create', trackingID, domain);
			__gaTracker('send', 'pageview');
			onSuccess(true);
		}		
		else {
			paella.debug.log("No Google Tracking ID found in config file. Disabling Google Analitycs PlugIn");
			onSuccess(false);
		}				
	},

	onEvent:function(eventType, params) {
		if (this.config.trackingEvents) {
			var category = this.config.category || "PaellaPlayer";
			var action = params.event;
			var label =  "";
			
			try {
				label = JSON.stringify({
					videoID: paella.player.videoIdentifier,
					label: params.label,
				});
			}
			catch(e) {}
							
			__gaTracker('send', 'event', category, action, label);
		}
	}	
});


paella.plugins.userTrackingGoogleAnalyticsSaverPlugIn = new paella.plugins.UserTrackingGoogleAnalyticsSaverPlugIn();



