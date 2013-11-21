
paella.plugins.FootPrintsPlugin = Class.create(paella.ButtonPlugin,{
	INTERVAL_LENGTH:5,
	inPosition:0,
	outPosition:0,	
	canvas: null,
	footPrintsTimer: null,
	footPrintsData: {},
	
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "footPrints"; },
	getIndex:function() { return 2100; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Show statistics"); },	
	getMinWindowSize:function() { return 700; },
	getName:function() { return "es.upv.paella.FootPrintsPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },


	setup:function(){
		var thisClass = this;
		paella.events.bind(paella.events.timeUpdate, function(event) { thisClass.onTimeUpdate(); });
	},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
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
		var videoCurrentTime = Math.round(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart());
		if (this.inPosition <= videoCurrentTime && videoCurrentTime <= this.inPosition + this.INTERVAL_LENGTH) {
			this.outPosition = videoCurrentTime;
			if (this.inPosition + this.INTERVAL_LENGTH === this.outPosition) {
				this.trackFootPrint(this.inPosition, this.outPosition);
				this.inPosition = this.outPosition;
			}
		}
		else {
			this.trackFootPrint(this.inPosition, this.outPosition);
			this.inPosition = videoCurrentTime;
			this.outPosition = videoCurrentTime;
		}
    },
    
    trackFootPrint:function(inPosition, outPosition) {
    	var data = {"in": inPosition, "out": outPosition};		
		paella.data.write('footprints',{id:paella.initDelegate.getId()}, data);		
    },
	
	willShowContent:function() {
		var thisClass = this;
		this.loadFootprints();
		this.footPrintsTimer = new paella.utils.Timer(function(timer) {
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
			var duration = Math.floor(paella.player.videoContainer.duration());
			var trimStart = Math.floor(paella.player.videoContainer.trimStart());
			
            var lastPosition = -1;
            var lastViews = 0;
			for (var i = 0; i < data.length; i++) {
				position = data[i].position - trimStart;
				if (position < duration){
					views = data[i].views;
					
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
    },
	
	drawFootPrints:function(footPrintsData) {
		if (this.canvas) {
			var duration = Object.keys(footPrintsData).length; 
			var ctx = this.canvas.getContext("2d");
			var h = 0;
			for (var i = 0; i<duration; ++i) {
				if (footPrintsData[i] > h) { h = footPrintsData[i]; } 
			}

			this.canvas.setAttribute("width", duration);
			this.canvas.setAttribute("height", h);
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.fillStyle = '#9ED4EE';
			ctx.strokeStyle = "#0000FF";
			ctx.lineWidth = 2;
			
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
						
			for (var i = 0; i<duration-1; ++i) {			
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
