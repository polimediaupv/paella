/*
CaptionDataDelegate Interface

* Langs Operation (return the langs supported)

	params: {
		id: videoID,
		op: 'langs'
	}
	
	Return:
		{
			error: false, 
			langs:[{
				code: 'es',
				text: 'Spanish'
			}]
		}	


* Caption Operation (return the captions)

	params: {
		id: videoID,
		op: 'caption'
		lang: 'es'
	}
	
	Return:
		{
			error: false,
			captions:[]
		}
	or
		{
			error: false,
			url: 'http://xxx'
			format: 'dxfp',
			
		}
*/


paella.dataDelegates.NoneCaptionsDataDelegate = Class.create(paella.DataDelegate,{	
	initialize:function() {
	},
	
	read:function(context, params, onSuccess) {
		var op = params.op;
		var ret;
				
		if (op == "langs") {
			ret = { error: false, langs:[] };
			if (onSuccess) { onSuccess(ret, true); }
		}
		else if (op == "langs") {
			ret = { error: false, captions:[] };
			if (onSuccess) { onSuccess(ret, true); }
		}
		else {
			if (onSuccess) { onSuccess({error: true}, true); }
        }
	},
	
	write:function(context,params,value,onSuccess) {
		if (onSuccess) { onSuccess({}, false); }
	},
	
	remove:function(context,params,onSuccess) {
		if (onSuccess) { onSuccess({}, false); }
	}
});