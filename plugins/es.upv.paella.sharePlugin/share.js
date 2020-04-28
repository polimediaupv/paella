
paella.addPlugin(function() {
	return class SharePlugin extends paella.ButtonPlugin {
		getAlignment() { return 'right'; }
		getSubclass() { return 'shareButtonPlugin'; }
		getIconClass() { return 'icon-social'; }
		getIndex() { return 560; }
		getName() { return 'es.upv.paella.sharePlugin'; }
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		getDefaultToolTip() { return paella.utils.dictionary.translate('Share this video'); }
		
		checkEnabled(onSuccess) { onSuccess(true); }
		closeOnMouseOut() { return false; }

		setup() {
		}

		buildEmbed() {
			var self = this;
			var embed = document.createElement('div');

			embed.innerHTML = `
				<div>
					<div class="form-group">
						<label class="control-label">
							<input id="share-video-responsive" type="checkbox" value="3" name="mailId[]" > ${ paella.utils.dictionary.translate('Responsive design') }
						</label>
					</div>

					<div id="share-video-block-size" class="form-group">
						<label class="control-label"> ${ paella.utils.dictionary.translate('Video resolution') } </label>
						
						<div class="row">
							<div class="col-sm-6">
								<select id="share-video-size" class="form-control input-sm">
									<option value="640x360">360p</option>
									<option value="854x480">480p</option>
									<option value="1280x720">720p (HD)</option>
									<option value="1920x1080">1080p (Full HD)</option>
									<option value="2560x1440">1440p (2.5K)</option>
									<option value="3840x2160">2160p (4K UHD)</option>
									<option value="custom">${ paella.utils.dictionary.translate('Custom size') }</option>
								</select>
							</div>
							<div class="col-sm-3">
								<input id="share-video-width" type="number" class="form-control input-sm" value="640" disabled="disabled">
							</div>
							<div class="col-sm-3">
								<input id="share-video-height" type="number" class="form-control input-sm" value="360" disabled="disabled">
							</div>
						</div>
					</div>	

					<div id="share-video-block-resp" class="form-group" style="display:none;">
						<label class="control-label"> ${ paella.utils.dictionary.translate('Video resolution') } </label>
						
						<select id="share-video-size-resp" class="form-control input-sm">
							<option value="25">25%</option>
							<option value="33">33%</option>
							<option value="50">50%</option>
							<option value="33">66%</option>
							<option value="75">75%</option>
							<option value="100">100%</option>
						</select>						
					</div>						
					
					<div class="form-group">
						<label class="control-label">${ paella.utils.dictionary.translate('Embed code') }</label>
						
						<div id="share-video-embed" class="alert alert-share">
						</div>
					</div>
				</div>
			`;


			embed.querySelector("#share-video-responsive").onchange=function(event){
				var responsive = self._domElement.querySelector("#share-video-responsive").checked;
				if (responsive) {
					self._domElement.querySelector("#share-video-block-resp").style.display = "block";
					self._domElement.querySelector("#share-video-block-size").style.display = "none";
				}
				else {
					self._domElement.querySelector("#share-video-block-resp").style.display = "none";
					self._domElement.querySelector("#share-video-block-size").style.display = "block";
				}
				self.updateEmbedCode(); 
			}

			embed.querySelector("#share-video-size-resp").onchange=function(event){ self.updateEmbedCode(); }
			embed.querySelector("#share-video-width").onchange=function(event){ self.updateEmbedCode(); }
			embed.querySelector("#share-video-height").onchange=function(event){ self.updateEmbedCode(); }
			
			embed.querySelector("#share-video-size").onchange=function(event){ 
				var value = event.target? event.target.value: event.toElement.value;
				
				if (value == "custom") {
					embed.querySelector("#share-video-width").disabled = false;
					embed.querySelector("#share-video-height").disabled = false;
				}
				else {
					embed.querySelector("#share-video-width").disabled = true;
					embed.querySelector("#share-video-height").disabled = true;

					var size = value.trim().split("x");
					embed.querySelector("#share-video-width").value = size[0];
					embed.querySelector("#share-video-height").value = size[1];
				}
				self.updateEmbedCode();
			}
			return embed;
		}

		buildSocial() {
			var self = this;
			var social = document.createElement('div');
			social.innerHTML = `
				<div>
					<div class="form-group">
						<label class="control-label">${ paella.utils.dictionary.translate('Share on social networks') }</label>
						<div class="row" style="margin:0;">	
							<span id="share-btn-facebook" class="share-button button-icon icon-facebook" ></span>
							<span id="share-btn-twitter" class="share-button button-icon icon-twitter" ></span>
							<span id="share-btn-linkedin" class="share-button button-icon icon-linkedin" ></span>
						</div>
					</div>
				</div>
			`;

			social.querySelector("#share-btn-facebook").onclick=function(event){ self.onSocialClick('facebook'); }
			social.querySelector("#share-btn-twitter").onclick=function(event){ self.onSocialClick('twitter'); }
			social.querySelector("#share-btn-linkedin").onclick=function(event){ self.onSocialClick('linkedin'); }
			return social;
		}


		buildContent(domElement) {
			var hideSocial = this.config && this.config.hideSocial;
			this._domElement = domElement;

			domElement.appendChild(this.buildEmbed());
			if (!hideSocial) {
				domElement.appendChild(this.buildSocial());
			}

			this.updateEmbedCode();
		}


		getVideoUrl() {
			var url = document.location.href;
			return url;
		}

		onSocialClick(network) {
			var videoUrl = encodeURIComponent(this.getVideoUrl());
			var title = encodeURIComponent("");
			var shareUrl;

			switch (network) {
				case ('twitter'):
					shareUrl = `http://twitter.com/share?url=${videoUrl}&text=${title}`;
					break;
				case ('facebook'):
					shareUrl = `http://www.facebook.com/sharer.php?u=${videoUrl}&p[title]=${title}`;
					break;
				case ('linkedin'):
					shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${videoUrl}&title=${title}`;
					break;
			}
			
			if (shareUrl) {
				window.open(shareUrl);
			}
			paella.player.controls.hidePopUp(this.getName());
		}

		updateEmbedCode() {
			var videoUrl = this.getVideoUrl();
			var responsive = this._domElement.querySelector("#share-video-responsive").checked;
			var width = this._domElement.querySelector("#share-video-width").value;
			var height = this._domElement.querySelector("#share-video-height").value;
			var respSize = this._domElement.querySelector("#share-video-size-resp").value;
			
			var embedCode = '';
			if (responsive) {
				embedCode = `<div style="width:${respSize}%"><div style="position:relative;display:block;height:0;padding:0;overflow:hidden;padding-bottom:56.25%"> <iframe allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" src="${videoUrl}" style="border:0px #FFFFFF none; position:absolute; width:100%; height:100%" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="100%" height="100%"></iframe> </div></div>`;
			}
			else {
				embedCode = `<iframe allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" src="${videoUrl}" style="border:0px #FFFFFF none;" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="${width}" height="${height}"></iframe>`;
			}

			this._domElement.querySelector("#share-video-embed").innerText = embedCode;
		}

	}
});
