(() => {
    paella.utils = paella.utils || {};

    // This class requires jquery
    paella.utils.ajax = {
        // onSuccess/onFail(data,type,returnCode,rawData)
        send:function(type,params,onSuccess,onFail) {
            this.assertParams(params);

            var ajaxObj = jQuery.ajax({
                url:params.url,
                data:params.params,
                type:type
            });

            if (typeof(onSuccess)=='function') {
                ajaxObj.done(function(data,textStatus,jqXHR) {
                    var contentType = jqXHR.getResponseHeader('content-type')
                    onSuccess(data,contentType,jqXHR.status,jqXHR.responseText);
                });
            }

            if (typeof(onFail)=='function') {
                ajaxObj.fail(function(jqXHR,textStatus,error) {
                    onFail(textStatus + ' : ' + error,'text/plain',jqXHR.status,jqXHR.responseText);
                });
            }
        },

        assertParams:function(params) {
            if (!params.url) throw new Error("paella.utils.ajax.send: url parameter not found");
            if (!params.params) params.params = {}
        }
    }

    paella.utils.ajax["get"] = function(params,onSuccess,onFail) {
        paella.utils.ajax.send('get',params,onSuccess,onFail);
    }

    paella.utils.ajax["post"] = function(params,onSuccess,onFail) {
        paella.utils.ajax.send('post',params,onSuccess,onFail);
    }

    paella.utils.ajax["put"] = function(params,onSuccess,onFail) {
        paella.utils.ajax.send('put',params,onSuccess,onFail);
    }

    paella.utils.ajax["delete"] = function(params,onSuccess,onFail) {
        paella.utils.ajax.send('delete',params,onSuccess,onFail);
    }

    // TODO: AsyncLoader is deprecated and should be replaced by promises
    class AsyncLoaderCallback {
        constructor(name) {
            this.name = name;
            this.prevCb = null;
            this.nextCb = null;
            this.loader = null;
        }
    
        load(onSuccess,onError) {
            onSuccess();
            // If error: onError()
        }
    }

    paella.utils.AsyncLoaderCallback = AsyncLoaderCallback;
    
    class AjaxCallback extends paella.utils.AsyncLoaderCallback {
        getParams() {
            return this.params;
        }
    
        willLoad(callback) {
    
        }
    
        didLoadSuccess(callback) {
            return true;
        }
    
        didLoadFail(callback) {
            return false;
        }
    
        constructor(params,type) {
            super();

            this.params = null;
            this.type = 'get';
            this.data = null;
            this.mimeType = null;
            this.statusCode = null;
            this.rawData = null;
        
            
            this.name = "ajaxCallback";
            if (type) this.type = type;
            if (typeof(params)=='string') this.params = {url:params}
            else if (typeof(params)=='object') this.params = params;
            else this.params = {}
        }
    
        load(onSuccess,onError) {
            var This = this;
            if (typeof(this.willLoad)=='function') this.willLoad(this);
            paella.utils.ajax.send(this.type,this.getParams(),
                function(data,type,code,rawData) {
                    var status = true;
                    This.data = data;
                    This.mimeType = type;
                    This.statusCode = code;
                    This.rawData = rawData;
                    if (typeof(This.didLoadSuccess)=='function') status = This.didLoadSuccess(This);
                    if (status) onSuccess();
                    else onError();
                },
                function(data,type,code,rawData) {
                    var status = false;
                    This.data = data;
                    This.mimeType = type;
                    This.statusCode = code;
                    This.rawData = rawData;
                    if (typeof(This.didLoadFail)=='function') status = This.didLoadFail(This);
                    if (status) onSuccess();
                    else onError();
                });
        }
    }

    paella.utils.AjaxCallback = AjaxCallback;
    
    class JSONCallback extends paella.utils.AjaxCallback {
        constructor(params,type) {
            super(params,type);
        }
    
        didLoadSuccess(callback) {
            if (typeof(callback.data)=='object') return true;
    
            try {
                callback.data = JSON.parse(callback.data);
                return true;
            }
            catch (e) {
                callback.data = {error:"Unexpected data format",data:callback.data}
                return false;
            }
        }
    }

    paella.utils.JSONCallback = JSONCallback;
    
    class AsyncLoader {
        
        clearError() {
            this.errorCallbacks = [];
        }
    
        constructor() {
            this.firstCb = null;
            this.lastCb = null;
            this.callbackArray = null;
            this.generatedId = 0;
            this.continueOnError = false;
            this.errorCallbacks = null;
            this.currentCb = null;
            
            this.callbackArray = {};
            this.errorCallbacks = [];
            this.generatedId = 0;
        }
    
        addCallback(cb,name) {
            if (!name) {
                name = "callback_" + this.generatedId++;
            }
            cb.__cbName__ = name;
            this.callbackArray[name] = cb;
            if (!this.firstCb) {
                this.firstCb = cb;
                this.currentCb = cb;
            }
            cb.prevCb = this.lastCb;
            if (this.lastCb) this.lastCb.nextCb = cb;
            this.lastCb = cb;
            cb.loader = this;
            return cb;
        }
    
        getCallback(name) {
            return this.callbackArray[name];
        }
    
        load(onSuccess,onError) {
            console.warn("paella.utils.AsyncLoader is deprecated. Consider to replace it with JavaScript promises.");
            
            var This = this;
            if (this.currentCb) {
                this.currentCb.load(function() {
                    This.onComplete(This.currentCb,This.currentCb.__cbName__,true);
                    This.currentCb = This.currentCb.nextCb;
                    This.load(onSuccess,onError);
                },
                function() {
                    This.onComplete(This.currentCb,This.currentCb.__cbName__,false);
                    if (This.continueOnError) {
                        This.errorCallbacks.push(This.currentCb);
                        This.currentCb = This.currentCb.nextCb;
                        This.load(onSuccess,onError);
                    }
                    else if (typeof(onError)=='function') {
                        onError();
                    }
                });
            }
            else if (typeof(onSuccess)=='function') {
                onSuccess();
            }
        }
    
        onComplete(callback,cbName,status) {
    
        }
    }

    paella.utils.AsyncLoader = AsyncLoader;

})();
