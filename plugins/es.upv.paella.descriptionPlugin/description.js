Class ("paella.plugins.DescriptionPlugin",paella.TabBarPlugin,{
	getSubclass:function() { return "showDescriptionTabBar"; },
	getName:function() { return "es.upv.paella.descriptionPlugin"; },
	getTabName:function() { return "Descripción"; },
			
	domElement:null,
			
	buildContent:function(domElement) {
		this.domElement = domElement;
		this.loadContent();
	},
			
	action:function(tab) {
		this.loadContent();
	},
			
	loadContent:function() {
		var container = this.domElement;
		container.innerHTML = "Loading...";
		new paella.Timer(function(t) {
			container.innerHTML = "Loading done";
		},2000);
	}
	
});
  

paella.plugins.descriptionPlugin = new paella.plugins.DescriptionPlugin();