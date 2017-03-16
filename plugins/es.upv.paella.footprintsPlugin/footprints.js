Class ("paella.plugins.FootPrintsPlugin",paella.ButtonPlugin,{
	INTERVAL_LENGTH:5,
	inPosition:0,
	outPosition:0,
	canvas: null,
	footPrintsTimer: null,
	footPrintsData: {},

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "footPrints"; },
	getIndex:function() { return 590; },
	getDefaultToolTip:function() { return base.dictionary.translate("Show statistics"); },
	getName:function() { return "es.upv.paella.footprintsPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },


	setup:function(){
		var thisClass = this;
		paella.events.bind(paella.events.timeUpdate, function(event) { thisClass.onTimeUpdate(); });

		switch(this.config.skin) {
		case 'custom':
			this.fillStyle = this.config.fillStyle;
			this.strokeStyle = this.config.strokeStyle;
			break;

		case 'dark':
			this.fillStyle = '#727272';
			this.strokeStyle = '#424242';
			break;

		case 'light':
			this.fillStyle = '#d8d8d8';
			this.strokeStyle = '#ffffff';
			break;

		default:
			this.fillStyle = '#d8d8d8';
			this.strokeStyle = '#ffffff';
			break;
		}

	},

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	buildContent:function(domElement) {
		var container = document.createElement('div');
		container.className = 'footPrintsContainer';

		this.canvas = document.createElement('canvas');
		this.canvas.id = 'footPrintsCanvas';
		this.canvas.className = 'footPrintsCanvas';
		container.appendChild(this.canvas);


		domElement.appendChild(container);
	},

    onTimeUpdate:function() {
    	var self = this;
   		paella.player.videoContainer.currentTime()
		.then(function(currentTime) {	
			var videoCurrentTime = Math.round(currentTime + paella.player.videoContainer.trimStart());
			if (self.inPosition <= videoCurrentTime && videoCurrentTime <= self.inPosition + self.INTERVAL_LENGTH) {
				self.outPosition = videoCurrentTime;
				if (self.inPosition + self.INTERVAL_LENGTH === self.outPosition) {
					self.trackFootPrint(self.inPosition, self.outPosition);
					self.inPosition = self.outPosition;
				}
			}
			else {
				self.trackFootPrint(self.inPosition, self.outPosition);
				self.inPosition = videoCurrentTime;
				self.outPosition = videoCurrentTime;
			}
		});
    },

    trackFootPrint:function(inPosition, outPosition) {
    	var data = {"in": inPosition, "out": outPosition};
		paella.data.write('footprints',{id:paella.initDelegate.getId()}, data);
    },

	willShowContent:function() {
		var thisClass = this;
		this.loadFootprints();
		this.footPrintsTimer = new base.Timer(function(timer) {
			thisClass.loadFootprints();
		},5000);
		this.footPrintsTimer.repeat = true;
	},

	didHideContent:function() {
		if (this.footPrintsTimer!=null) {
			this.footPrintsTimer.cancel();
			this.footPrintsTimer = null;
		}
	},

	loadFootprints:function () {
		var thisClass = this;
		paella.data.read('footprints',{id:paella.initDelegate.getId()},function(data,status) {
			var footPrintsData = {};
			paella.player.videoContainer.duration().then(function(duration){
				var trimStart = Math.floor(paella.player.videoContainer.trimStart());

				var lastPosition = -1;
				var lastViews = 0;
				for (var i = 0; i < data.length; i++) {
					var position = data[i].position - trimStart;
					if (position < duration){
						var views = data[i].views;

						if (position - 1 != lastPosition){
							for (var j = lastPosition + 1; j < position; j++) {
								footPrintsData[j] = lastViews;
							}
						}
						footPrintsData[position] = views;
						lastPosition = position;
						lastViews = views;
					}
				}
				thisClass.drawFootPrints(footPrintsData);
			});
		});
	},

	drawFootPrints:function(footPrintsData) {
		if (this.canvas) {
			var duration = Object.keys(footPrintsData).length;
			var ctx = this.canvas.getContext("2d");
			var h = 20;
			var i;
			for (i = 0; i<duration; ++i) {
				if (footPrintsData[i] > h) { h = footPrintsData[i]; }
			}

			this.canvas.setAttribute("width", duration);
			this.canvas.setAttribute("height", h);
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.fillStyle = this.fillStyle; //'#faa166'; //'#9ED4EE';
			ctx.strokeStyle = this.strokeStyle; //'#fa8533'; //"#0000FF";
			ctx.lineWidth = 2;

			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;

			for (i = 0; i<duration-1; ++i) {
				ctx.beginPath();
				ctx.moveTo(i, h);
				ctx.lineTo(i, h-footPrintsData[i]);
				ctx.lineTo(i+1, h-footPrintsData[i+1]);
				ctx.lineTo(i+1, h);
				ctx.closePath();
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(i, h-footPrintsData[i]);
				ctx.lineTo(i+1, h-footPrintsData[i+1]);
				ctx.closePath();
				ctx.stroke();
			}
		}
	}
});

paella.plugins.footPrintsPlugin = new paella.plugins.FootPrintsPlugin();
