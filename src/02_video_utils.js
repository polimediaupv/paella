/**
 * Created by fernando on 15/12/15.
 */


Class ("paella.VideoQualityStrategy", {
	getQualityIndex:function(source) {
		if (source.length>0) {
			return source[source.length-1];
		}
		else {
			return source;
		}
	}
});

// TODO: Modify quality strategies

Class ("paella.BestFitVideoQualityStrategy",paella.VideoQualityStrategy,{
	getQualityIndex:function(source) {
		var index = source.length - 1;

		if (source.length>0) {
			var selected = source[0];
			var win_w = $(window).width();
			var win_h = $(window).height();
			var win_res = (win_w * win_h);

			if (selected.res && selected.res.w && selected.res.h) {
				var selected_res = parseInt(selected.res.w) * parseInt(selected.res.h);
				var selected_diff = Math.abs(win_res - selected_res);

				for (var i=0; i<source.length; ++i) {
					var res = source[i].res;
					if (res) {
						var m_res = parseInt(source[i].res.w) * parseInt(source[i].res.h);
						var m_diff = Math.abs(win_res - m_res);

						if (m_diff < selected_diff){
							selected_diff = m_diff;
							index = i;
						}
					}
				}
			}
		}

		return index;
	}
});


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

