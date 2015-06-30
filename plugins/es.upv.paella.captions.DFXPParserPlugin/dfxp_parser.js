(function(){
	
/////////////////////////////////////////////////
// DFXP Parser
/////////////////////////////////////////////////
Class ("paella.captions.parsers.DFXPParserPlugin", paella.CaptionParserPlugIn, {
	ext: ["dfxp"],
	getName: function() { return "es.upv.paella.captions.DFXPParserPlugin"; },
	parse: function(content, lang, next) {
		var captions = [];
		var self = this;
		var xml = $(content);
		var g_lang = xml.attr("xml:lang");
		
		var lls = xml.find("div");
		for(var idx=0; idx<lls.length; ++idx) {
			var ll = $(lls[idx]);
			var l_lang = ll.attr("xml:lang");
			if ((l_lang == undefined) || (l_lang == "")){
				if ((g_lang == undefined) || (g_lang == "")) {
					base.log.debug("No xml:lang found! Using '" + lang + "' lang instead.");
					l_lang = lang;
				}
				else {
					l_lang = g_lang;
				}
			}
			//
			if (l_lang == lang) {
				ll.find("p").each(function(i, cap){
					var c = {
						id: i,
		            	begin: self.parseTimeTextToSeg(cap.getAttribute("begin")),
		            	end: self.parseTimeTextToSeg(cap.getAttribute("end")),
		            	content: $(cap).text().trim()
		            };				
					captions.push(c);				
				});
				break;
			}
		}
		
		if (captions.length > 0) {
			next(false, captions);
		}
		else {
			next(true);
		}
	},

    parseTimeTextToSeg:function(ttime){
            var nseg = 0;
            var segtime = /^([0-9]*([.,][0-9]*)?)s/.test(ttime);
            if (segtime){
                    nseg = parseFloat(RegExp.$1);
            }
            else {
                    var split = ttime.split(":");
                    var h = parseInt(split[0]);
                    var m = parseInt(split[1]);
                    var s = parseInt(split[2]);
                    nseg = s+(m*60)+(h*60*60);
            }
            return nseg;
    }
});


new paella.captions.parsers.DFXPParserPlugin();


}());