var _paq = _paq || [];

paella.addPlugin(function() {
	return class PiwikAnalyticsTracking extends paella.userTracking.SaverPlugIn {

		getName() { return "es.upv.paella.usertracking.piwikSaverPlugIn"; }
		
		checkEnabled(onSuccess) {
			if (this.config.tracker && this.config.siteId) {
				_paq.push(['trackPageView']);
				_paq.push(['enableLinkTracking']);
				(function() {
					var u=this.config.tracker;
					_paq.push(['setTrackerUrl', u+'/piwik.php']);
					_paq.push(['setSiteId', this.config.siteId]);
					var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
					g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
					onSuccess(true);
				})();			
			}
			else {
				onSuccess(false);
			}
		}
		
		log(event, params) {
				var category = this.config.category || "PaellaPlayer";
				var action = event;
				var label =  "";
				
				try {
					label = JSON.stringify(params);
				}
				catch(e) {}
				
				_paq.push(['trackEvent', category, action, label]);
		}
	}
});
