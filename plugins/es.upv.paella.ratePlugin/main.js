
paella.addPlugin(function() {
	return class RatePlugin extends paella.ButtonPlugin {
		
		getAlignment() { return 'right'; }
		getSubclass() { return "rateButtonPlugin"; }
		getIconClass() { return 'icon-star'; }
		getIndex() { return 540; }
		getName() { return "es.upv.paella.ratePlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Rate this video"); }		
		checkEnabled(onSuccess) {
			this.buttonItems = null;
			this.buttons =  [];
			this.selected_button =  null;
			this.score = 0;
			this.count = 0;
			this.myScore = 0;
			this.canVote = false;
			this.scoreContainer =  {
				header:null,
				rateButtons:null
			};
			paella.data.read('rate',{id:paella.initDelegate.getId()}, (data,status) => {
				if (data && typeof(data)=='object') {
					this.score = Number(data.mean).toFixed(1);
					this.count = data.count;
					this.myScore = data.myScore;
					this.canVote = data.canVote;
				}
				onSuccess(status);
			});
		}

		setup() {
		}

		setScore(s) {
			this.score = s;
			this.updateScore();
		}

		closeOnMouseOut() { return true; }

		updateHeader() {
			let score = paella.utils.dictionary.translate("Not rated");
			if (this.count>0) {
				score = '<i class="glyphicon glyphicon-star"></i>';
				score += ` ${ this.score } ${ this.count } ${ paella.utils.dictionary.translate('votes') }`;
			}

			this.scoreContainer.header.innerHTML = `
			<div>
				<h4>${ paella.utils.dictionary.translate('Video score') }:</h4>
				<h5>
					${ score }
				</h5>
				</h4>
				<h4>${ paella.utils.dictionary.translate('Vote:') }</h4>
			</div>
			`;
		}

		updateRateButtons() {
			this.scoreContainer.rateButtons.className = "rateButtons";
			this.buttons = [];
			if (this.canVote) {
				this.scoreContainer.rateButtons.innerText = "";
				for (let i = 0; i<5; ++i) {
					let btn = this.getStarButton(i + 1);
					this.buttons.push(btn);
					this.scoreContainer.rateButtons.appendChild(btn);
				}
			}
			else {
				this.scoreContainer.rateButtons.innerHTML = `<h5>${ paella.utils.dictionary.translate('Login to vote')}</h5>`;
			}
			this.updateVote();
		}

		buildContent(domElement) {
			var This = this;
			This._domElement = domElement;

			var header = document.createElement('div');
			domElement.appendChild(header);
			header.className = "rateContainerHeader";
			this.scoreContainer.header = header;
			this.updateHeader();

			var rateButtons = document.createElement('div');
			this.scoreContainer.rateButtons = rateButtons;
			domElement.appendChild(rateButtons);
			this.updateRateButtons();
		}

		getStarButton(score) {
			let This = this;
			let elem = document.createElement('i');
			elem.data = {
				score: score,
				active: false
			};
			elem.className = "starButton glyphicon glyphicon-star-empty";
			$(elem).click(function(event) {
				This.vote(this.data.score);
			});
			return elem;
		}

		vote(score) {
			this.myScore = score;
			let data = {
				mean: this.score,
				count: this.count,
				myScore: score,
				canVote: this.canVote
			};
			paella.data.write('rate',{id:paella.initDelegate.getId()}, data, (result) => {
				paella.data.read('rate',{id:paella.initDelegate.getId()}, (data,status) => {
					if (data && typeof(data)=='object') {
						this.score = Number(data.mean).toFixed(1);
						this.count = data.count;
						this.myScore = data.myScore;
						this.canVote = data.canVote;
					}
					this.updateHeader();
					this.updateRateButtons();
				});
			});
		}

		updateVote() {
			this.buttons.forEach((item,index) => {
				item.className = index<this.myScore ? "starButton glyphicon glyphicon-star" : "starButton glyphicon glyphicon-star-empty";
			});
		}
	}
});