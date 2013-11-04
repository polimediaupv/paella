paella.plugins.CommentsPlugin = Class.create(paella.TabBarPlugin,{
	divRoot:null,
	divPublishComment:null,
	divComments:null,
	publishCommentTextArea:null,
	publishCommentButtons:null,
	canPublishAComment: false,
	commentsTree: [],
	domElement:null,
  
	getSubclass:function() { return "showCommentsTabBar"; },
	getName:function() { return "es.upv.paella.commentsPlugin"; },
	getTabName:function() { return paella.dictionary.translate("Comments"); },
	checkEnabled:function(onSuccess) { onSuccess(paella.extended); },
					     
	action:function(tab) {
		this.loadContent();
	},
			
	buildContent:function(domElement) {
		this.domElement = domElement;
		this.canPublishAComment = paella.initDelegate.initParams.accessControl.permissions.canWrite;
		this.loadContent();
	},
				
	loadContent:function() {
		this.divRoot = this.domElement;
		this.divRoot.innerHTML ="";
		
		this.divPublishComment = document.createElement('div');
		this.divPublishComment.className = 'CommentPlugin_Publish';
		this.divPublishComment.id = 'CommentPlugin_Publish';

		this.divComments = document.createElement('div'); 
		this.divComments.className = 'CommentPlugin_Comments';
		this.divComments.id = 'CommentPlugin_Comments';

		this.divRoot.appendChild(this.divComments);
		
		//this.canPublishAComment = false;
		if(this.canPublishAComment){
			this.divRoot.appendChild(this.divPublishComment);
			this.createPublishComment();
		}
		this.reloadComments();
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
		var txtValue = thisClass.publishCommentTextArea.value;
		txtValue = txtValue.replace(/<>/g, "< >");  //TODO: Hacer este replace bien!

		//TODO: Guardar comentario
		
		//thisClass.reloadComments();
		thisClass.loadContent();
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
		thisClass.commentsTree = [];
		this.divComments.innerHTML ="";
		
		var comment = {};
		comment["id"] = "01"
		comment["user"] = "User 1"
		comment["type"] = "valueType";
		comment["text"] = "valueTex valueText";
		comment["userId"] = "userId";
		comment["created"] = "03/03/2013";
		comment["replies"] = [];
		thisClass.commentsTree.push(comment);
		
		var comment = {};
		comment["id"] = "02"
		comment["user"] = "User 2"
		comment["type"] = "valueType";
		comment["text"] = "valueTextvalueTextvalueTextvalueText";
		comment["userId"] = "userId";
		comment["created"] = "10/10/2013";
		comment["replies"] = [];
		thisClass.commentsTree.push(comment);
		
		var comment = {};
		var replies = [];
		var commentReply = {};

		commentReply["id"] = "04"
		commentReply["user"] = "User 2"
		commentReply["type"] = "valueType";
		commentReply["text"] = "valueTextvalueTextvalueTextvalueText";
		commentReply["userId"] = "userId";
		commentReply["created"] = "13/10/2013";
		commentReply["replies"] = [];
		replies.push(commentReply);
		
		comment["id"] = "03"
		comment["user"] = "User 3"
		comment["type"] = "valueType";
		comment["text"] = "valueTextvalueTextvalueTextvalueText";
		comment["userId"] = "userId";
		comment["created"] = "12/10/2013";
		comment["replies"] = replies;
		thisClass.commentsTree.push(comment);
		
		
		thisClass.displayComments();
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
		
		var divCommentMetadata;
		divCommentMetadata = document.createElement('div');
		divCommentMetadata.id = rootID+"_comment_metadata"; 
		divCommentContainer.appendChild(divCommentMetadata);
		
		var datePublish = comment["created"];
		
		var headLine = "<span class='comments_entry_username'>" + comment["user"] + "</span>";
		/*if (comment["type"] === "scrubber"){
                        var publishTime = comment["inpoint"];
                        if (paella.player.videoContainer.trimEnabled()){
                            publishTime = comment.inpoint - paella.player.videoContainer.trimStart();
                        }
			headLine += "<span class='comments_entry_timed'> " + paella.utils.timeParse.secondsToTime(publishTime) + "</span>";
		}*/
		headLine += "<span class='comments_entry_datepublish'>" + datePublish + "</span>";
		
		divCommentMetadata.innerHTML = headLine;
		
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
				this.parentElement.parentElement.appendChild(e);
			};
			btnRplyComment.innerHTML = paella.dictionary.translate("Reply");
			divCommentReply.appendChild(btnRplyComment);
		}
		
		for (var i =0; i < comment["replies"].length; ++i ){
			var e = thisClass.createACommentReplyEntry(comment["id"], comment["replies"][i]);
			divCommentContainer.appendChild(e);
		}
		return divEntry;
	},
	
	createACommentReplyEntry:function(parentID, comment) {
		var thisClass = this;
		var rootID = this.divPublishComment.id+"_entry_" + parentID + "_reply_" + comment["id"];

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
			
		var divCommentMetadata;
		divCommentMetadata = document.createElement('div');
		divCommentMetadata.id = rootID+"_comment_metadata"; 
		divCommentContainer.appendChild(divCommentMetadata);
		var datePublish = comment["created"];
		
		/*if (comment["created"]) {
			var dateToday=new Date()
			var dateComment = paella.utils.timeParse.matterhornTextDateToDate(comment["created"]);			
			datePublish = paella.utils.timeParse.secondsToText((dateToday.getTime()-dateComment.getTime())/1000);
		}	*/	
		
		var headLine = "<span class='comments_entry_username'>" + comment["user"] + "</span>";
		headLine += "<span class='comments_entry_datepublish'>" + datePublish + "</span>";
 
		divCommentMetadata.innerHTML = headLine;
		
		var divCommentValue;
		divCommentValue = document.createElement('div');
		divCommentValue.id = rootID+"_comment_value";
		divCommentValue.className = "comments_entry_comment";
		divCommentContainer.appendChild(divCommentValue);		
		
		divCommentValue.innerHTML = comment["text"];
			
		return divEntry;
	},
	
	createAReplyEntry:function(annotationID) {
		var thisClass = this;
		var rootID = this.divPublishComment.id+"_entry_" + annotationID + "_reply";

		var divEntry;
		divEntry = document.createElement('div');
		divEntry.id = rootID+"_entry";
		divEntry.className = "comments_entry";
		
		var divSil;
		divSil = document.createElement('img');
		divSil.className = "comments_entry_silhouette";
		divSil.id = rootID+"_silhouette";
		divSil.src = "plugins/silhouette32.png";
		divEntry.appendChild(divSil);
		
		var divCommentContainer;
		divCommentContainer = document.createElement('div');
		divCommentContainer.className = "comments_entry_container comments_reply_container";
		divCommentContainer.id = rootID+"_reply_container";
		divEntry.appendChild(divCommentContainer);
	
		var textArea;
		textArea = document.createElement('textArea');
		textArea.id = rootID+"_textarea";
		divCommentContainer.appendChild(textArea);
		
		this.publishCommentButtons = document.createElement('div');
		this.publishCommentButtons.id = rootID+"_buttons_area";
		divCommentContainer.appendChild(this.publishCommentButtons);
		
		var btnAddComment;
		btnAddComment = document.createElement('button');
		btnAddComment.id = rootID+"_btnAddComment";
		btnAddComment.className = "publish";
		btnAddComment.onclick = function(){thisClass.addReply(annotationID,textArea.id);};
		btnAddComment.innerHTML = paella.dictionary.translate("Reply");
		
		this.publishCommentButtons.appendChild(btnAddComment);
		
		return divEntry;
	}
});
  

paella.plugins.commentsPlugin = new paella.plugins.CommentsPlugin();

