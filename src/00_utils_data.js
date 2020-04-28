(function() {
	let g_delegateCallbacks = {};
	let g_dataDelegates = [];

	class DataDelegate {
		read(context,params,onSuccess) {
			if (typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}

		write(context,params,value,onSuccess) {
			if (typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}

		remove(context,params,onSuccess) {
			if (typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}
	}

	paella.DataDelegate = DataDelegate;

	paella.dataDelegates = {};

	class Data {
		get enabled() { return this._enabled; }

		get dataDelegates() { return g_dataDelegates; }
	
		constructor(config) {
			this._enabled = config.data.enabled;

			// Delegate callbacks
			let executedCallbacks = [];
			for (let context in g_delegateCallbacks) {
				let callback = g_delegateCallbacks[context];
				let DelegateClass = null;
				let delegateName = null;

				if (!executedCallbacks.some((execCallbackData) => {
					if (execCallbackData.callback==callback) {
						delegateName = execCallbackData.delegateName;
						return true;
					}
				})) {
					DelegateClass = g_delegateCallbacks[context]();
					delegateName = DelegateClass.name;
					paella.dataDelegates[delegateName] = DelegateClass;
					executedCallbacks.push({ callback:callback, delegateName:delegateName });
				}

				if (!config.data.dataDelegates[context]) {
					config.data.dataDelegates[context] = delegateName;
				}

			}

			for (var key in config.data.dataDelegates) {
				try {
					
					var delegateName = config.data.dataDelegates[key];
					var DelegateClass = paella.dataDelegates[delegateName];
					var delegateInstance = new DelegateClass();
					g_dataDelegates[key] = delegateInstance;
				
				}
				catch (e) {
					console.warn("Warning: delegate not found - " + delegateName);
				}
			}


			// Default data delegate
			if (!this.dataDelegates["default"]) {
				this.dataDelegates["default"] = new paella.dataDelegates.DefaultDataDelegate();
			}
		}
	
		read(context,key,onSuccess) {
			var del = this.getDelegate(context);
			del.read(context,key,onSuccess);
		}
	
		write(context,key,params,onSuccess) {
			var del = this.getDelegate(context);
			del.write(context,key,params,onSuccess);
		}
	
		remove(context,key,onSuccess) {
			var del = this.getDelegate(context);
			del.remove(context,key,onSuccess);
		}
	
		getDelegate(context) {
			if (this.dataDelegates[context]) return this.dataDelegates[context];
			else return this.dataDelegates["default"];
		}
	}

	paella.Data = Data;

	paella.addDataDelegate = function(context,callback) {
		if (Array.isArray(context)) {
			context.forEach((ctx) => {
				g_delegateCallbacks[ctx] = callback;
			})
		}
		else if (typeof(context)=="string") {
			g_delegateCallbacks[context] = callback;
		}
	}

})();

paella.addDataDelegate(["default","trimming"], () => {
	paella.dataDelegates.DefaultDataDelegate = class CookieDataDelegate extends paella.DataDelegate {
		serializeKey(context,params) {
			if (typeof(params)=='object') {
				params = JSON.stringify(params);
			}
			return context + '|' + params;
		}
	
		read(context,params,onSuccess) {
			var key = this.serializeKey(context,params);
			var value = paella.utils.cookies.get(key);
			try {
				value = unescape(value);
				value = JSON.parse(value);
			}
			catch (e) {}
			if (typeof(onSuccess)=='function') {
				onSuccess(value,true);
			}
		}
	
		write(context,params,value,onSuccess) {
			var key = this.serializeKey(context,params);
			if (typeof(value)=='object') {
				value = JSON.stringify(value);
			}
			value = escape(value);
			paella.utils.cookies.set(key,value);
			if(typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}
	
		remove(context,params,onSuccess) {
			var key = this.serializeKey(context,params);
			if (typeof(value)=='object') {
				value = JSON.stringify(value);
			}
			paella.utils.cookies.set(key,'');
			if(typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}
	}

	return paella.dataDelegates.DefaultDataDelegate;
})

// Will be initialized inmediately after loading config.json, in PaellaPlayer.onLoadConfig()
paella.data = null;