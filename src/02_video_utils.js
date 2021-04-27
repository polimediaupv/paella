/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/


(function() {
	class VideoQualityStrategy {
		static Factory() {
			var config = paella.player.config;

			try {
				var strategyClass = config.player.videoQualityStrategy;
				var ClassObject = paella.utils.objectFromString(strategyClass);
				var strategy = new ClassObject();
				if (strategy instanceof paella.VideoQualityStrategy) {
					return strategy;
				}
			}
			catch (e) {
			}
			
			return null;
		}

		getParams() {
			return paella.player.config.player.videoQualityStrategyParams || {};
		}
	
		getQualityIndex(source) {
			if (source.length>0) {
				return source[source.length-1];
			}
			else {
				return source;
			}
		}
	}

	paella.VideoQualityStrategy = VideoQualityStrategy;
	
	class BestFitVideoQualityStrategy extends paella.VideoQualityStrategy {
		getQualityIndex(source) {
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
	
							if (m_diff <= selected_diff){
								selected_diff = m_diff;
								index = i;
							}
						}
					}
				}
			}
	
			return index;
		}
	}

	paella.BestFitVideoQualityStrategy = BestFitVideoQualityStrategy;
	
	class LimitedBestFitVideoQualityStrategy extends paella.VideoQualityStrategy {
		getQualityIndex(source) {
			var index = source.length - 1;
			var params = this.getParams();
	
			if (source.length>0) {
				//var selected = source[0];
				var selected = null;
				var win_h = $(window).height();
				var maxRes = params.maxAutoQualityRes || 720;
				var diff = Number.MAX_VALUE;
	
				source.forEach(function(item,i) { 
					if (item.res && item.res.h<=maxRes ) {
						var itemDiff = Math.abs(win_h - item.res.h);
						if (itemDiff<diff) {
							selected = item;
							index = i;
						}
					}
				});
			}
			return index;
		}
	}

	paella.LimitedBestFitVideoQualityStrategy = LimitedBestFitVideoQualityStrategy;

	class VideoFactory {
		isStreamCompatible(streamData) {
			return false;
		}
	
		getVideoObject(id, streamData, rect) {
			return null;
		}
	}

	paella.VideoFactory = VideoFactory;
	paella.videoFactories = paella.videoFactories || {};

	paella.videoFactory = {
		_factoryList:[],
	
		initFactories:function() {
			if (paella.videoFactories) {
				var This = this;
				paella.player.config.player.methods.forEach(function(method) {
					if (method.enabled && paella.videoFactories[method.factory]) {
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
	
	
})();
