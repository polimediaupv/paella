var MyTabBarExamplePlugin = Class.create(paella.TabBarPlugin,{
	getSubclass:function() { return "test"; },
	getTabName:function() { return "TabBar Example"; },
	getName:function() { return "es.upv.paella.test.tabBarExamplePlugin"; },

	buildContent:function(domElement) {
		domElement.innerHTML = "<p>This is a Paella Extended tab bar plugin</p>";
	}
});

new MyTabBarExamplePlugin();
