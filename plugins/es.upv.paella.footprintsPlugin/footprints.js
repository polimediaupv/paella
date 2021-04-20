paella.addPlugin(function() {
	return class FootPrintsPlugin extends paella.ButtonPlugin {
		get INTERVAL_LENGTH() { return this._INTERVAL_LENGTH; }
		set INTERVAL_LENGTH(v) { this._INTERVAL_LENGTH = v; }
		get inPosition() { return this._inPosition; }
		set inPosition(v) { this._inPosition = v; }
		get outPosition() { return this._outPosition; }
		set outPosition(v) { this._outPosition = v; }
		get canvas() { return this._canvas; }
		set canvas(v) { this._canvas = v; }
		get footPrintsTimer() { return this._footPrintsTimer; }
		set footPrintsTimer(v) { this._footPrintsTimer = v; }
		get footPrintsData() { return this._footPrintsData; }
		set footPrintsData(v) { this._footPrintsData = v; }

		getAlignment() { return 'right'; }
		getSubclass() { return "footPrints"; }
		getIconClass() { return 'icon-stats'; }
		getIndex() { return 590; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Show statistics"); }
		getName() { return "es.upv.paella.footprintsPlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.timeLineButton; }
	
		setup(){
			this._INTERVAL_LENGTH = 5;
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
		}
	
		checkEnabled(onSuccess) {
			onSuccess(!paella.player.isLiveStream());
		}
	
		buildContent(domElement) {
			var container = document.createElement('div');
			container.className = 'footPrintsContainer';
	
			this.canvas = document.createElement('canvas');
			this.canvas.id = 'footPrintsCanvas';
			this.canvas.className = 'footPrintsCanvas';
			container.appendChild(this.canvas);
	
	
			domElement.appendChild(container);
		}
	
		onTimeUpdate() {
			let currentTime = -1;
			paella.player.videoContainer.currentTime()
				.then((c) => {
					currentTime = c;
					return paella.player.videoContainer.trimming();
				})
				.then((trimming) => {
					let videoCurrentTime = Math.round(currentTime + (trimming.enabled ? trimming.start : 0));
					if (this.inPosition <= videoCurrentTime && videoCurrentTime <= this.inPosition + this.INTERVAL_LENGTH) {
						this.outPosition = videoCurrentTime;
						if ((this.inPosition + this.INTERVAL_LENGTH)===this.outPosition) {
							this.trackFootPrint(this.inPosition, this.outPosition);
							this.inPosition = this.outPosition;
						}
					}
					else {
						this.trackFootPrint(this.inPosition, this.outPosition);
						this.inPosition = videoCurrentTime;
						this.outPosition = videoCurrentTime;
					}
				});
		}

		trackFootPrint(inPosition, outPosition) {
			var data = {"in": inPosition, "out": outPosition};
			paella.data.write('footprints',{id:paella.initDelegate.getId()}, data);
		}
	
		willShowContent() {
			var thisClass = this;
			this.loadFootprints();
			this.footPrintsTimer = new paella.utils.Timer(function(timer) {
				thisClass.loadFootprints();
			},5000);
			this.footPrintsTimer.repeat = true;
		}
	
		didHideContent() {
			if (this.footPrintsTimer!=null) {
				this.footPrintsTimer.cancel();
				this.footPrintsTimer = null;
			}
		}
	
		loadFootprints() {
			var thisClass = this;
			paella.data.read('footprints',{id:paella.initDelegate.getId()},function(data,status) {
				var footPrintsData = {};
				paella.player.videoContainer.duration().then(async (duration) => {
					var trimStart = Math.floor(await paella.player.videoContainer.trimStart());
	
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
		}

		drawFootPrints(footPrintsData) {
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
	}
});
