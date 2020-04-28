(function() {
    class MessageBox {
		get modalContainerClassName() { return 'modalMessageContainer'; } 
		get frameClassName() { return 'frameContainer'; }
		get messageClassName() { return 'messageContainer'; }
		get errorClassName() { return 'errorContainer'; }
		
		get currentMessageBox() { return this._currentMessageBox; }
		set currentMessageBox(m) { this._currentMessageBox = m; } 
		get messageContainer() { return this._messageContainer; }
		get onClose() { return this._onClose; }
		set onClose(c) { this._onClose = c; }
	
		constructor() {
			this._messageContainer = null;
			$(window).resize((event) => this.adjustTop());
		}

		showFrame(src,params) {
			var closeButton = true;
			var onClose = null;
			if (params) {
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowFrame(src,closeButton,onClose);
		}
	
		doShowFrame(src,closeButton,onClose) {
			this.onClose = onClose;
			$('#playerContainer').addClass("modalVisible");
	
			if (this.currentMessageBox) {
				this.close();
			}
	
			var modalContainer = document.createElement('div');
			modalContainer.className = this.modalContainerClassName;
			modalContainer.style.position = 'fixed';
			modalContainer.style.top = '0px';
			modalContainer.style.left = '0px';
			modalContainer.style.right = '0px';
			modalContainer.style.bottom = '0px';
			modalContainer.style.zIndex = 999999;

			var messageContainer = document.createElement('div');
			messageContainer.className = this.frameClassName;
			modalContainer.appendChild(messageContainer);
	
			var iframeContainer = document.createElement('iframe');
			iframeContainer.src = src;
			iframeContainer.setAttribute("frameborder", "0");
			iframeContainer.style.width = "100%";
			iframeContainer.style.height = "100%";
			messageContainer.appendChild(iframeContainer);
	
			if (paella.player && paella.player.isFullScreen()) {
				paella.player.mainContainer.appendChild(modalContainer);
			}else{
				$('body')[0].appendChild(modalContainer);
			}
	
			this.currentMessageBox = modalContainer;
			this._messageContainer = messageContainer;
			this.adjustTop();
	
			if (closeButton) {
				this.createCloseButton();
			}
		}
	
		showElement(domElement,params) {
			var closeButton = true;
			var onClose = null;
			var className = this.messageClassName;
			if (params) {
				className = params.className;
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowElement(domElement,closeButton,className,onClose);
		}
	
		showMessage(message,params) {
			var closeButton = true;
			var onClose = null;
			var className = this.messageClassName;
			if (params) {
				className = params.className;
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowMessage(message,closeButton,className,onClose);
		}
	
		doShowElement(domElement,closeButton,className,onClose) {
			this.onClose = onClose;
			$('#playerContainer').addClass("modalVisible");
	
			if (this.currentMessageBox) {
				this.close();
			}
			if (!className) className = this.messageClassName;
	
			var modalContainer = document.createElement('div');
			modalContainer.className = this.modalContainerClassName;
			modalContainer.style.position = 'fixed';
			modalContainer.style.top = '0px';
			modalContainer.style.left = '0px';
			modalContainer.style.right = '0px';
			modalContainer.style.bottom = '0px';
			modalContainer.style.zIndex = 999999;
	
			var messageContainer = document.createElement('div');
			messageContainer.className = className;
			messageContainer.appendChild(domElement);
			modalContainer.appendChild(messageContainer);
	
			$('body')[0].appendChild(modalContainer);
	
			this.currentMessageBox = modalContainer;
			this._messageContainer = messageContainer;
			this.adjustTop();
	
			if (closeButton) {
				this.createCloseButton();
			}
		}
	
		doShowMessage(message,closeButton,className,onClose) {
			this.onClose = onClose;
			$('#playerContainer').addClass("modalVisible");
	
			if (this.currentMessageBox) {
				this.close();
			}
			if (!className) className = this.messageClassName;
	
			var modalContainer = document.createElement('div');
			modalContainer.className = this.modalContainerClassName;
			modalContainer.style.position = 'fixed';
			modalContainer.style.top = '0px';
			modalContainer.style.left = '0px';
			modalContainer.style.right = '0px';
			modalContainer.style.bottom = '0px';
			modalContainer.style.zIndex = 999999;
	
			var messageContainer = document.createElement('div');
			messageContainer.className = className;
			messageContainer.innerHTML = message;
			modalContainer.appendChild(messageContainer);
	
			if (paella.player && paella.player.isFullScreen()) {
				paella.player.mainContainer.appendChild(modalContainer);
			}else{
				$('body')[0].appendChild(modalContainer);
			}
	
			this.currentMessageBox = modalContainer;
			this._messageContainer = messageContainer;
			this.adjustTop();
	
			if (closeButton) {
				this.createCloseButton();
			}
		}

		showError(message,params) {
			var closeButton = false;
			var onClose = null;
			if (params) {
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowError(message,closeButton,onClose);
		}
	
		doShowError(message,closeButton,onClose) {
			this.doShowMessage(message,closeButton,this.errorClassName,onClose);
		}
	
		createCloseButton() {
			if (this._messageContainer) {
				var closeButton = document.createElement('span');
				this._messageContainer.appendChild(closeButton);
				closeButton.className = 'paella_messageContainer_closeButton icon-cancel-circle';
				$(closeButton).click((event) => this.onCloseButtonClick());
				$(window).keyup((evt) => {
					if (evt.keyCode == 27) {
						this.onCloseButtonClick();
					}
				});
		
			}
		}
		
		adjustTop() {
			if (this.currentMessageBox) {
	
				var msgHeight = $(this._messageContainer).outerHeight();
				var containerHeight = $(this.currentMessageBox).height();
	
				var top = containerHeight/2 - msgHeight/2;
				this._messageContainer.style.marginTop = top + 'px';
			}
		}
		
		close() {
			if (this.currentMessageBox && this.currentMessageBox.parentNode) {
				var msgBox = this.currentMessageBox;
				var parent = msgBox.parentNode;
				$('#playerContainer').removeClass("modalVisible");
				$(msgBox).animate({opacity:0.0},300,function() {
					parent.removeChild(msgBox);
				});
				if (this.onClose) {
					this.onClose();
				}
			}
		}
	
		onCloseButtonClick() {
			this.close();
		}
	}
	
	paella.MessageBox = MessageBox;
	paella.messageBox = new paella.MessageBox();
})();
