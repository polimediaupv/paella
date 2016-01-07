/**
 * Created by fernando on 15/12/15.
 */


Class ("paella.VideoQualityStrategy", {
	getStream:function(source,stream,userSelection) {
		if (source.length>0) {
			return source[0];
		}
		else {
			return source;
		}
	}
});

// TODO: Paella currently does not use any quality strategy
/*
Class ("paella.BestFitVideoQualityStrategy",paella.VideoQualityStrategy,{
	getStream:function(source,stream,userSelection) {
		if (source.length>0) {
			var selected = source[0];
			var win_w = $(window).width();
			var win_h = $(window).height();
			var win_res = (win_w * win_h);
			var selected_res = parseInt(selected.res.w) * parseInt(selected.res.h);
			var selected_diff = Math.abs(win_res - selected_res);

			for (var i=0; i<source.length; ++i) {
				var res = source[i].res;
				if (res) {
					if (userSelection != undefined) {
						res = res.w + "x" + res.h;
						if (res==userSelection) {
							selected = source[i];
							break;
						}
					}
					else{
						var m_res = parseInt(source[i].res.w) * parseInt(source[i].res.h);
						var m_diff = Math.abs(win_res - m_res);

						if (m_diff < selected_diff){
							selected_diff = m_diff;
							selected = source[i];
						}


					}
				}
			}
			return selected;
		}
		else {
			return source;
		}
	}
});
*/


Class ("paella.VideoFactory", {
	isStreamCompatible:function(streamData) {
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		return null;
	}
});

paella.videoFactory = {
	_factoryList:[],

	initFactories:function() {
		if (paella.videoFactories) {
			var This = this;
			paella.player.config.player.methods.forEach(function(method) {
				if (method.enabled) {
					This.registerFactory(new paella.videoFactories[method.factory]());
				}
			});
			this.registerFactory(new paella.videoFactories.EmptyVideoFactory());
		}
	},

	getVideoObject:function(id, streamData, rect) {
		if (this._factoryList.length==0) {
			this.initFactories();
		}
		var selectedFactory = null;
		if (this._factoryList.some(function(factory) {
			if (factory.isStreamCompatible(streamData)) {
				selectedFactory = factory;
				return true;
			}
		})) {
			return selectedFactory.getVideoObject(id, streamData, rect);
		}
		return null;
	},

	registerFactory:function(factory) {
		this._factoryList.push(factory);
	}
};

