paella.plugins.CommentsPlugin = Class.create(paella.TabBarPlugin,{
	id:null,
	divRoot:null,
	divPublishComment:null,
	divComments:null,
	divLoading:null,
  
	getSubclass:function() { return "showCommentsTabBar"; },
	getName:function() { return "es.upv.paella.commentsPlugin"; },
	getTabName:function() { return "Comentarios"; },
			
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
		
		/*var container = this.domElement;
		
		this.divPublishComment = document.createElement('div');
		this.divPublishComment.className = 'CommentPlugin_Publish';
		
		this.divLoading = document.createElement('div');
		this.divLoading.className = 'CommentPlugin_Loading';		
		
		this.divComments = document.createElement('div'); 
		this.divComments.className = 'CommentPlugin_Comments';
		this.divComments.innerHTML = "Texto";

		
		container.appendChild(this.divPublishComment);
		container.appendChild(this.divLoading);
		container.appendChild(this.divComments);*/
		
		
		
	}
	
});
  

paella.plugins.commentsPlugin = new paella.plugins.CommentsPlugin();

