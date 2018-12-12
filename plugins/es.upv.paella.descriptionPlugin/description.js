/*
paella.addPlugin(function() {

	return class DescriptionPlugin extends paella.TabBarPlugin {
		getSubclass() { return "showDescriptionTabBar"; }
		getName() { return "es.upv.paella.descriptionPlugin"; }
		getTabName() { return "Descripción"; }
				
		get domElement() { return this._domElement || null; }
		set domElement(d) { this._domElement = d; }
				
		buildContent(domElement) {
			this.domElement = domElement;
			this.loadContent();
		}
				
		action(tab) {
			this.loadContent();
		}
				
		loadContent() {
			var container = this.domElement;
			container.innerText = "Loading...";
			new paella.Timer(function(t) {
				container.innerText = "Loading done";
			},2000);
		}
	}
})
*/
