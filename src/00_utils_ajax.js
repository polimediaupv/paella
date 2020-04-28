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

})();
