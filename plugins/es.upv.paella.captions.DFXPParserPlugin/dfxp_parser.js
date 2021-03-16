paella.addPlugin(function() {
		
	/////////////////////////////////////////////////
	// DFXP Parser
	/////////////////////////////////////////////////
	return class DFXPParserPlugin extends paella.CaptionParserPlugIn {
		get ext() { return ["dfxp"] }
		getName() { return "es.upv.paella.captions.DFXPParserPlugin"; }
		parse(content, lang, next) {
			var captions = [];
			var self = this;

			//fix malformed xml replacing the malformed characters with blank
			content = content.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm, '')
			content = content.replace(/&\w+;/gmi,'')
			content = content.replaceAll('<br>','')
			
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(content,"text/xml");	
			//var xmlDoc = $.parseXML(content);
			var xml = $(xmlDoc);
			var g_lang = xml.attr("xml:lang");
			
			var lls = xml.find("div");
			for(var idx=0; idx<lls.length; ++idx) {
				var ll = $(lls[idx]);
				var l_lang = ll.attr("xml:lang");
				if ((l_lang == undefined) || (l_lang == "")){
					if ((g_lang == undefined) || (g_lang == "")) {
						paella.log.debug("No xml:lang found! Using '" + lang + "' lang instead.");
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
		}

		parseTimeTextToSeg(ttime){
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
	}
});
