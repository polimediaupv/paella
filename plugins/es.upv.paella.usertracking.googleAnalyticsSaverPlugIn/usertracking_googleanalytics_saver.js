

new (Class (paella.userTracking.SaverPlugIn,{
	getName:function() { return "es.upv.paella.usertracking.GoogleAnalyticsSaverPlugin"; },
		
	checkEnabled:function(onSuccess) {
		var trackingID = this.config.trackingID;
		var domain = this.config.domain || "auto";
		if (trackingID){
			base.log.debug("Google Analitycs Enabled");
			/* jshint ignore:start */
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,'script','//www.google-analytics.com/analytics.js','__gaTracker');
			/* jshint ignore:end */
			__gaTracker('create', trackingID, domain);
			__gaTracker('send', 'pageview');
			onSuccess(true);
		}		
		else {
			base.log.debug("No Google Tracking ID found in config file. Disabling Google Analitycs PlugIn");
			onSuccess(false);
		}				
	},


	log: function(event, params) {
		if ((this.config.category === undefined) || (this.config.category ===true)) {
			var category = this.config.category || "PaellaPlayer";
			var action = event;
			var label =  "";
			
			try {
				label = JSON.stringify(params);
			}
			catch(e) {}
			
			__gaTracker('send', 'event', category, action, label);
		}
	}
	
}))();






