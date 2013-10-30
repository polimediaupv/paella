paella.plugins.CommentsPlugin = Class.create(paella.TabBarPlugin,{
	divRoot:null,
	divPublishComment:null,
	divComments:null,
	divLoading:null,
	publishCommentTextArea:null,
	publishCommentButtons:null,
	commentsTree: [],
  
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
		this.divRoot = this.domElement;
		
		this.divPublishComment = document.createElement('div');
		this.divPublishComment.className = 'CommentPlugin_Publish';
		this.divPublishComment.id = 'CommentPlugin_Publish';
		
		this.divLoading = document.createElement('div');
		this.divLoading.className = 'CommentPlugin_Loading';
		this.divLoading.id = 'CommentPlugin_Loading';	
		
		this.divComments = document.createElement('div'); 
		this.divComments.className = 'CommentPlugin_Comments';
		this.divComments.id = 'CommentPlugin_Comments';

		//container.appendChild(this.divPublishComment);
		//container.appendChild(this.divLoading);
		this.divRoot.appendChild(this.divComments);
		
		if(paella.initDelegate.initParams.accessControl.permissions.canWrite){
		  this.createPublishComment();
		}
	  
		/*var container = this.domElement;
		container.innerHTML = "Loading...";
		new paella.Timer(function(t) {
			container.innerHTML = "Loading done";
		},2000);*/
		
		//this.createPublishComment();
		
	},
	
	createPublishComment:function() {
		var thisClass = this;
		var rootID = this.divPublishComment.identifier+"_entry";
		
		this.divEntry = document.createElement('div');
		this.divEntry.className = 'comments_entry';
		
		this.divComments.appendChild(this.divEntry);
		
		var divSil;
		this.divSil = document.createElement('img');
		this.divSil.className = 'comments_entry_silhouette';
		this.divSil.src = "plugins/silhouette32.png";
		this.divEntry.appendChild(this.divSil);
		
		var divTextAreaContainer;
		this.divTextAreaContainer = document.createElement('div');
		this.divTextAreaContainer.className = "comments_entry_container";
		this.divEntry.appendChild(this.divTextAreaContainer);
		//this.divTextAreaContainer.onclick = function(){thisClass.onClickTextAreaContainer(divTextAreaContainer)};
		
		this.publishCommentTextArea = document.createElement('textarea');
		this.divTextAreaContainer.appendChild(this.publishCommentTextArea);
		
		this.publishCommentButtons = document.createElement('div');
		this.divTextAreaContainer.className = "comments_entry_container"; 
		this.divTextAreaContainer.appendChild(this.publishCommentButtons);
		
		var btnAddComment;
		this.btnAddComment = document.createElement('button');
		this.btnAddComment.className = "publish";
		this.btnAddComment.onclick = function(){thisClass.addComment();};
		this.btnAddComment.innerHTML = "Publicar";
		
		this.publishCommentButtons.appendChild(this.btnAddComment);
		
		this.divTextAreaContainer.commentsTextArea = this.publishCommentTextArea;
		this.divTextAreaContainer.commentsBtnAddComment = this.btnAddComment;
		this.divTextAreaContainer.commentsBtnAddCommentToInstant = this.btnAddCommentToInstant;
	},
		
	addComment:function(){
		var thisClass = this;
		var txtValue = this.publishCommentTextArea.value;
		txtValue = txtValue.replace(/<>/g, "< >");  //TODO: Hacer este replace bien!
	
		console.log('Texto: '+txtValue)
		
		//TODO: Guardar comentario
	},
	
	addReply:function(annotationID, domNodeId){
		var thisClass = this;
                
                var textArea = document.getElementById(domNodeId);

		var txtValue = textArea.value;
		textArea.value = "";
		
			thisClass.reloadComments();
	},
	
	reloadComments:function() {                          
		
	},
	
	setLoadingComments:function(b) {
	},
	
	createACommentEntry:function(comment) {
		var thisClass = this;
		var rootID = this.divPublishComment.identifier+"_entry";
		
		this.divEntry = document.createElement('div');
		this.divEntry.className = 'comments_entry';
		
		this.divComments.appendChild(this.divEntry);
		
		var divSil;
		this.divSil = document.createElement('img');
		this.divSil.className = 'comments_entry_silhouette';
		this.divSil.src = "plugins/silhouette32.png";
		this.divEntry.appendChild(this.divSil);
		
		var divTextAreaContainer;
		this.divTextAreaContainer = document.createElement('div');
		this.divTextAreaContainer.className = "comments_entry_container";
		this.divEntry.appendChild(this.divTextAreaContainer);
		//this.divTextAreaContainer.onclick = function(){thisClass.onClickTextAreaContainer(divTextAreaContainer)};
		
		this.publishCommentTextArea = document.createElement('textarea');
		this.divTextAreaContainer.appendChild(this.publishCommentTextArea);
		
		this.publishCommentButtons = document.createElement('div');
		this.divTextAreaContainer.className = "comments_entry_container"; 
		this.divTextAreaContainer.appendChild(this.publishCommentButtons);
		
		var btnAddComment;
		this.btnAddComment = document.createElement('button');
		this.btnAddComment.className = "publish";
		this.btnAddComment.onclick = function(){thisClass.addComment();};
		this.btnAddComment.innerHTML = "Publicar";
		
		this.publishCommentButtons.appendChild(this.btnAddComment);
		
		this.divTextAreaContainer.commentsTextArea = this.publishCommentTextArea;
		this.divTextAreaContainer.commentsBtnAddComment = this.btnAddComment;
		this.divTextAreaContainer.commentsBtnAddCommentToInstant = this.btnAddCommentToInstant;
	
	}
	

});
  

paella.plugins.commentsPlugin = new paella.plugins.CommentsPlugin();

