paella.plugins.CommentsPlugin = Class.create(paella.TabBarPlugin,{
	divRoot:null,
	divPublishComment:null,
	divComments:null,
	divLoading:null,
	publishCommentTextArea:null,
	publishCommentButtons:null,
	canPublishAComment: false,
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

		this.divRoot.appendChild(this.divPublishComment);
		//this.divRoot.appendChild(this.divLoading);
		this.divRoot.appendChild(this.divComments);
		
		
		this.canPublishAComment = paella.initDelegate.initParams.accessControl.permissions.canWrite;
		if(this.canPublishAComment){
			this.createPublishComment();
			this.reloadComments();
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
		var rootID = this.divPublishComment.id+"_entry";
		
		var divEntry;
		divEntry = document.createElement('div');
		divEntry.id = rootID;
		divEntry.className = 'comments_entry';
		
		var divSil;
		divSil = document.createElement('img');
		divSil.className = "comments_entry_silhouette";
		divSil.id = rootID+"_silhouette";
		divEntry.appendChild(divSil);
		
		var divTextAreaContainer;
		divTextAreaContainer = document.createElement('div');
		divTextAreaContainer.className = "comments_entry_container";
		divTextAreaContainer.id = rootID+"_textarea_container";
		//this.divTextAreaContainer.onclick = function(){thisClass.onClickTextAreaContainer(divTextAreaContainer)};
		divEntry.appendChild(divTextAreaContainer);
		
		this.publishCommentTextArea = document.createElement('textarea');
		this.publishCommentTextArea.id = rootID+"_textarea";
		divTextAreaContainer.appendChild(this.publishCommentTextArea);
		
		this.publishCommentButtons = document.createElement('div');
		this.publishCommentButtons.id = rootID+"_buttons_area";
		divTextAreaContainer.appendChild(this.publishCommentButtons);
		
		var btnAddComment;
		btnAddComment = document.createElement('button');
		btnAddComment.id = rootID+"_btnAddComment";
		btnAddComment.className = "publish";
		btnAddComment.onclick = function(){thisClass.addComment();};
		btnAddComment.innerHTML = paella.dictionary.translate("Publish");
		
		this.publishCommentButtons.appendChild(btnAddComment);
		
		divTextAreaContainer.commentsTextArea = this.publishCommentTextArea;
		divTextAreaContainer.commentsBtnAddComment = btnAddComment;
		divTextAreaContainer.commentsBtnAddCommentToInstant = this.btnAddCommentToInstant;
		
		this.divPublishComment.appendChild(divEntry);
	},
		
	addComment:function(){
		var thisClass = this;
		var txtValue = this.publishCommentTextArea.value;
		txtValue = txtValue.replace(/<>/g, "< >");  //TODO: Hacer este replace bien!
	
		console.log('Texto: '+txtValue)
		
		//TODO: Guardar comentario
		
		
		//thisClass.reloadComments();
	},
	
	addReply:function(annotationID, domNodeId){
		var thisClass = this;
                
                var textArea = document.getElementById(domNodeId);

		var txtValue = textArea.value;
		textArea.value = "";
		
			thisClass.reloadComments();
	},
	
	reloadComments:function() {     
		var thisClass = this;
		
		var comment = {};
		
		comment["id"] = "33"
		comment["user"] = "User"
		comment["type"] = "valueType";
		comment["text"] = "valueText \n valueText \n valueText \n valueText\nvalueText\nvalueText\nvalueText\nvalueText\n";
		comment["userId"] = "userId";
		comment["inpoint"] = "inpoint";
		comment["replies"] = [];
		thisClass.commentsTree.push(comment);
		
		
		var comment = {};
		
		comment["id"] = "56"
		comment["user"] = "User"
		comment["type"] = "valueType";
		comment["text"] = "valueTextvalueTextvalueTextvalueText";
		comment["userId"] = "userId";
		comment["inpoint"] = "inpoint";
		comment["replies"] = [];
		thisClass.commentsTree.push(comment);
		
		var comment = {};
		
		comment["id"] = "57"
		comment["user"] = "User"
		comment["type"] = "valueType";
		comment["text"] = "valueTextvalueTextvalueTextvalueText";
		comment["userId"] = "userId";
		comment["inpoint"] = "inpoint";
		comment["replies"] = [];
		thisClass.commentsTree.push(comment);
		
		var comment = {};
		
		comment["id"] = "5"
		comment["user"] = "User"
		comment["type"] = "valueType";
		comment["text"] = "valueTextvalueTextvalueTextvalueText";
		comment["userId"] = "userId";
		comment["inpoint"] = "inpoint";
		comment["replies"] = [];
		thisClass.commentsTree.push(comment);
		
		 thisClass.displayComments();
		
	},
	
	setLoadingComments:function(b) {
	},
	
	displayComments:function() {
          var thisClass = this;
          for (var i =0; i < thisClass.commentsTree.length; ++i ){
            var comment = thisClass.commentsTree[i];
            var e = thisClass.createACommentEntry(comment);
            thisClass.divComments.appendChild(e);
          } 

        },
	
	createACommentEntry:function(comment) {
		var thisClass = this;
		var rootID = this.divPublishComment.id+"_entry"+comment["id"];
		
		var divEntry;
		divEntry = document.createElement('div');
		divEntry.id = rootID;
		divEntry.className = "comments_entry";
		
		var divSil;
		divSil = document.createElement('img');
		divSil.className = "comments_entry_silhouette";
		divSil.id = rootID+"_silhouette";
		divSil.src = "plugins/silhouette32.png";
		divEntry.appendChild(divSil);
		
		var divCommentContainer;
		divCommentContainer = document.createElement('div');
		divCommentContainer.className = "comments_entry_container";
		divCommentContainer.id = rootID+"_comment_container";
		divEntry.appendChild(divCommentContainer);
		
		/*var divCommentMetadata;
		divCommentMetadata = document.create('div');
		divCommentMetadata.id = rootID+"_comment_metadata"; 
		divCommentContainer.appendChild(divCommentMetadata);
		//TODO:Fecha de publicación
		datePublish = "Datepublish";
		
		var headLine = "<span class='comments_entry_username'>" + comment["userId"] + "</span>";
		if (comment["type"] === "scrubber"){
                        var publishTime = comment["inpoint"];
                        if (paella.player.videoContainer.trimEnabled()){
                            publishTime = comment.inpoint - paella.player.videoContainer.trimStart();
                        }
			headLine += "<span class='comments_entry_timed'> " + paella.utils.timeParse.secondsToTime(publishTime) + "</span>";
		}
		headLine += "<span class='comments_entry_datepublish'>" + datePublish + "</span>";
		
		divCommentMetadata.innerHTML = headLine;*/
		
		var divCommentValue;
		divCommentValue = document.createElement('div');
		divCommentValue.id = rootID+"_comment_value";
		divCommentValue.className = "comments_entry_comment";
		divCommentContainer.appendChild(divCommentValue);		
		
		divCommentValue.innerHTML = comment["text"];
		
		var divCommentReply = document.createElement('div');
		divCommentReply.id = rootID+"_comment_reply";
		divCommentContainer.appendChild(divCommentReply);
		
		if (this.canPublishAComment == true) {
			var btnRplyComment = document.createElement('button');
			btnRplyComment.id = rootID+"_comment_reply_button";
			btnRplyComment.onclick = function(){
				var e = thisClass.createAReplyEntry(comment["id"]);
				this.style.display="none";
				this.parentElement.parentElement.appendChild(e.domElement);
			};
			btnRplyComment.innerHTML = paella.dictionary.translate("Reply");
			divCommentReply.appendChild(btnRplyComment);
		}
		
		for (var i =0; i < comment["replies"].length; ++i ){
			//var e = thisClass.createACommentReplyEntry(comment["id"], comment["replies"][i]);
			//divCommentContainer.appendChild(e);
		}
				
		return divEntry;
	}
});
  

paella.plugins.commentsPlugin = new paella.plugins.CommentsPlugin();

