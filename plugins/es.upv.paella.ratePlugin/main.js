Class ("paella.plugins.RatePlugin",paella.ButtonPlugin,{
	buttonItems:null,
	buttons: [],
	selected_button: null,
	score:0,
	count:0,
	myScore:0,
	canVote:false,

	scoreContainer: {
		header:null,
		rateButtons:null
	},

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "rateButtonPlugin"; },
	getIndex:function() { return 540; },
	getMinWindowSize:function() { return 500; },
	getName:function() { return "es.upv.paella.ratePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return base.dictionary.translate("Rate this video"); },		
	checkEnabled:function(onSuccess) {
		paella.data.read('rate',{id:paella.initDelegate.getId()},(data,status) => {
			if (data && typeof(data)=='object') {
				this.score = Number(data.mean).toFixed(1);
				this.count = data.count;
				this.myScore = data.myScore;
				this.canVote = data.canVote;
			}
			onSuccess(status);
		});
	},

	setup:function() {
		var thisClass = this;
		
        //this.setText(this.score);
    },

	setScore:function(s) {
		this.score = s;
		this.updateScore();
	},

	closeOnMouseOut:function() { return true; },

	updateHeader:function() {
		let score = base.dictionary.translate("Not rated");
		if (this.count>0) {
			score = '<i class="glyphicon glyphicon-star"></i>';
			score += ` ${ this.score }, ${ this.count } ${ base.dictionary.translate('votes') }`;
		}

		this.scoreContainer.header.innerHTML = `
		<div>
			<h4>${ base.dictionary.translate('Video score') }:</h4>
			<h5>
				${ score }
			</h5>
			</h4>
			<h4>${ base.dictionary.translate('Vote:') }</h4>
		</div>
		`;
	},

	updateRateButtons:function() {
		this.scoreContainer.rateButtons.className = "rateButtons";
		this.buttons = [];
		if (this.canVote) {
			this.scoreContainer.rateButtons.innerHTML = "";
			for (let i = 0; i<5; ++i) {
				let btn = this.getStarButton(i + 1);
				this.buttons.push(btn);
				this.scoreContainer.rateButtons.appendChild(btn);
			}
		}
		else {
			this.scoreContainer.rateButtons.innerHTML = `<h5>${ base.dictionary.translate('Login to vote')}</h5>`;
		}
		this.updateVote();
	},

	buildContent:function(domElement) {
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
	},

	getStarButton:function(score) {
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
	},

	vote:function(score) {
		this.myScore = score;
		let data = {
			mean: this.score,
			count: this.count,
			myScore: score,
			canVote: this.canVote
		};
		paella.data.write('rate',{id:paella.initDelegate.getId()}, data, (result) => {
			paella.data.read('rate',{id:paella.initDelegate.getId()},(data,status) => {
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
	},

	updateVote:function() {
		this.buttons.forEach((item,index) => {
			item.className = index<this.myScore ? "starButton glyphicon glyphicon-star" : "starButton glyphicon glyphicon-star-empty";
		});
	}
});

paella.plugins.ratePlugin = new paella.plugins.RatePlugin();
